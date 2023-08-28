import fs from "fs";
import { glob } from "glob";
import path from "path";
import { printError, printReason } from "../../utils/better-error-message";
import Compiler from "../../utils/compiler";
import removeUnusedEnumsAndTypes from "../../utils/del-unused-enum-types";
import { execProcess } from "../../utils/execute-process";
import typeSearcher from "../../utils/type-search";
import { IPrismaFieldOptions } from "../decorators/prisma-field.decorator";
import { IPrismaIndexOptions } from "../decorators/prisma-index.decorator";
import { IPrismaModelOptions } from "../decorators/prisma-model.decorator";
import { IPrismaRelationOptions } from "../decorators/prisma-relation.decorator";
import { ClassExtractor, ClassInfo } from "../reflect/extractor/class-extractor";
import { FileInfo } from "../reflect/file-info";
import { reflect } from "../reflect/reflect";
import { Relationships, createRelationships, generatePrismaRelations } from "./relation-generator";
import { removeModels } from "./model-remover";

const RELATIONS: Relationships[] = [];

export type Decorator = {
    model: IPrismaModelOptions;
    fields: IPrismaFieldOptions[];
    indexes: IPrismaIndexOptions[];
    relations: IPrismaRelationOptions[];
};

export function getDecorators(cls: any): Decorator {
    const modelDecorator =
        (Reflect.getMetadata("prisma:model", cls) as IPrismaModelOptions) || false;
    const fieldsDecorator =
        (Reflect.getMetadata("prisma:fields", cls) as IPrismaFieldOptions[]) || [];
    const indexOptions = (Reflect.getMetadata("prisma:index", cls) as IPrismaIndexOptions[]) || [];
    const relationOptions =
        (Reflect.getMetadata("prisma:relations", cls) as IPrismaRelationOptions[]) || [];

    return {
        model: modelDecorator,
        fields: fieldsDecorator,
        indexes: indexOptions,
        relations: relationOptions,
    };
}

export function getFileInfo(filePath: string): FileInfo[] | undefined {
    return reflect({ fileArray: [filePath] });
}

export function getClassInfo(cls: any, filePath: string): ClassInfo | undefined {
    return ClassExtractor.byName(ClassExtractor.classes(getFileInfo(filePath)!), cls.name);
}

export function getProviderValue(schemaPath: string): string {
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    // Get the provider value from the schema.prisma file
    const providerRegex = /datasource\s+db\s*\{[\s\S]*?provider\s*=\s*"([^"]*)"/;
    const matchProvider = schemaContent.match(providerRegex);

    return matchProvider ? matchProvider[1] : "";
}

export async function generatePrismaModel(
    cls: any,
    filePath: string,
    schemaPath: string,
): Promise<void> {
    const className = cls.name;
    const classInfo = getClassInfo(cls, filePath);
    const { model, fields, indexes, relations } = getDecorators(cls);

    if (model) {
        const idFields: string[] = [];
        const uniqueFields: string[] = [];

        const fieldStrings = fields.map((field) => {
            const { name, type, attr, isId, isOptional, isUnique, prismaDefault, mapField } = field;

            let convertedType: string | undefined = undefined;
            let convertedName: string | undefined = undefined;

            if (typeof type === "object" || typeof type === "function") {
                convertedName = classInfo?.properties.find((x) => x.name === name)?.name;
                convertedType = classInfo?.properties.find((x) => x.name === name)?.type;
            }

            let fieldString: string;
            if (convertedType && convertedName) {
                fieldString = `${convertedName} ${convertedType}`;
            } else {
                fieldString = `${name} ${type}`;
            }

            if (attr) {
                fieldString += ` ${attr}`;
            }

            if (isOptional == true) {
                fieldString += "?";
            } else {
                fieldString += "";
            }

            if (isId) {
                idFields.push(name!);
            }

            if (isUnique) {
                uniqueFields.push(name!);
            }

            if (prismaDefault) {
                if (prismaDefault === "@updatedAt") {
                    fieldString += ` ${prismaDefault}`;
                } else {
                    fieldString += ` @default(${prismaDefault})`;
                }
            }

            if (mapField) {
                fieldString += ` @map("${mapField}")`;
            }

            return fieldString;
        });

        const modelString = `model ${className} {\n  ${fieldStrings.join("\n  ")}\n}`;
        const schemaContent = fs.readFileSync(schemaPath, "utf-8");

        const modelRegex = new RegExp(`(model ${className} {[^}]*})`, "g");
        const modelExists = modelRegex.test(schemaContent);

        let updatedContent;
        if (modelExists) {
            updatedContent = schemaContent.replace(modelRegex, modelString);
        } else {
            updatedContent = `${schemaContent}\n\n${modelString}`;
        }

        // Join the idFields with comma separation and add them as a new fieldString if there's more than one id field
        if (idFields.length > 1) {
            const idFieldsString = `@@id([${idFields.join(", ")}])`;
            const modelRegex = new RegExp(`(model ${className} {[^}]*)`, "g");
            updatedContent = updatedContent.replace(modelRegex, `$1\n  ${idFieldsString}\n`);
        } else if (idFields.length === 1) {
            const regexPattern = `model\\s+${className}\\s+{[^}]*?${idFields[0]}\\s+\\w+[^}]*}`;
            const regex = new RegExp(regexPattern);
            updatedContent = updatedContent.replace(regex, (match) => {
                return match.replace(new RegExp(`(${idFields[0]} [A-Za-z]*)`), `$1 @id`);
            });
        }

        // Join the uniqueFields with comma separation and add them as a new fieldString if there's more than one unique field
        if (uniqueFields.length > 1) {
            const uniqueFieldsString = `@@unique([${uniqueFields.join(", ")}])`;
            const modelRegex = new RegExp(`(model ${className} {[^}]*)`, "g");
            updatedContent = updatedContent.replace(modelRegex, `$1\n  ${uniqueFieldsString}\n`);
        } else if (uniqueFields.length === 1) {
            const regexPattern = `model\\s+${className}\\s+{[^}]*?${idFields[0]}\\s+\\w+[^}]*}`;
            const regex = new RegExp(regexPattern);
            updatedContent = updatedContent.replace(regex, (match) => {
                return match.replace(new RegExp(`(${uniqueFields[0]} [A-Za-z]*)`), `$1 @unique`);
            });
        }

        // Add @@map model annotation
        if (model.map) {
            const modelRegex = new RegExp(`(model ${className} {[^}]*)`, "g");
            updatedContent = updatedContent.replace(modelRegex, `$1\n  @@map("${model.map}")\n`);
        }

        // Add @@index model annotation
        if (indexes) {
            for (const index of indexes) {
                const modelRegex = new RegExp(`(model ${className} {[^}]*)`, "g");
                const indexString = index.fields.join(", ");

                const map: string = index.map ? `map: "${index.map}"` : "";
                const name: string = index.name ? `name: "${index.name}"` : "";
                const type: string = index.type ? `type: ${index.type}` : "";

                const mapping: Array<any> = [];
                mapping.push(`[${indexString}]`);
                if (map) mapping.push(map);
                if (name) mapping.push(name);
                if (type) mapping.push(type);

                const indexGrouping = mapping.join(", ");
                updatedContent = updatedContent.replace(
                    modelRegex,
                    `$1\n  @@index(${indexGrouping})\n`,
                );
            }
        }

        // Collect the depending types
        const providerValue = getProviderValue(schemaPath);
        const providersNotSupportEnum = ["sqlserver", "sqlite"];
        const providersSupportTypes = ["mongodb"];

        if (classInfo) {
            for (const property of classInfo?.properties) {
                if (property.pathDeclaration && property.pathDeclaration !== "") {
                    const type = property.type.replace(/[\[\]?!]/g, "");
                    const field = fields.find((field) => field.name === property.name);

                    if (!field) {
                        continue;
                    }
                    const value = typeSearcher(type, property.pathDeclaration);
                    if (value) {
                        if (value?.includes("enum")) {
                            if (providersNotSupportEnum.includes(providerValue)) {
                                printError(`The Provider ${providerValue} not suport enums`, type);
                                continue;
                            }
                            const enumRegex = new RegExp(value, "g");
                            const enumExists = enumRegex.test(schemaContent);
                            if (enumExists) {
                                updatedContent = updatedContent.replace(enumRegex, value);
                            } else {
                                updatedContent = `${updatedContent}\n\n${value}`;
                            }
                        } else if (value?.includes("type")) {
                            if (!providersSupportTypes.includes(providerValue)) {
                                printError(`The Provider ${providerValue} not suport types`, type);
                                continue;
                            }
                            const typeRegex = new RegExp(value, "g");
                            const typeExists = typeRegex.test(schemaContent);
                            if (typeExists) {
                                updatedContent = updatedContent.replace(typeRegex, value);
                            } else {
                                updatedContent = `${updatedContent}\n\n${value}`;
                            }
                        }
                    }
                }
            }
        }

        if (cls && relations.length > 0) {
            // Generate relationships using map
            relations.map(async (relation) => {
                const relationships: Relationships | undefined = await createRelationships(
                    relation,
                    cls,
                    filePath,
                );

                if (relationships) {
                    RELATIONS.push(relationships);
                }
            });
        }

        fs.writeFileSync(schemaPath, updatedContent);
    } else {
        const className = cls.name;
        const schemaContent = fs.readFileSync(schemaPath, "utf-8");

        const modelRegex = new RegExp(`model ${className} {[^}]*}`, "g");
        const modelExists = modelRegex.test(schemaContent);

        let updatedContent;
        if (modelExists) {
            updatedContent = schemaContent.replace(modelRegex, "");
            fs.writeFileSync(schemaPath, updatedContent);
        }
    }
}

async function readAllEntities(
    entitiesPath: string,
    schemaPath: string,
    entityNamePattern: string,
): Promise<void> {
    const filesPath = `**/*.${entityNamePattern}.ts`;
    const files = glob.sync(filesPath, { cwd: `${process.cwd()}/${entitiesPath}` });

    if (!files || files.length === 0) {
        printError("No entity files found!", `Files: ${files ? files : "[]"}`);
        printReason([
            `There is no files in the informed path: \n[${entitiesPath}]`,
            `Check expressots.config.ts if the entityNamePattern: [${entityNamePattern}] is how you are creating` +
                `\n your entities files. Example: user.${entityNamePattern}.ts`,
            `Check if your package.json is pointing to the correct schema path: \n[${schemaPath}]`,
        ]);
        process.exit(1);
    }

    const generatePromises = files.map(async (file) => {
        const fileContent = fs.readFileSync(`${process.cwd()}/${entitiesPath}/${file}`, "utf-8");
        const classRegex = new RegExp("(?<!\\/\\/.*\\n)class\\s+(\\w+)", "g");
        const classNameMatch = [...fileContent.matchAll(classRegex)];

        if (classNameMatch.length === 0) {
            printError("Could not find class declarations in the file", `${file}`);
            return;
        }

        const promises = classNameMatch.map(async (match) => {
            const className = match[1];
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const tsNode = require("ts-node");
                // Load TypeScript configuration
                tsNode.register({
                    transpileOnly: true, // Only transpile, don't type-check
                    compilerOptions: {
                        target: "ESNext", // Target version
                        module: "CommonJS", // Output module format
                    },
                });

                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { [className]: EntityClass } = require(path.resolve(file)); // Use the dynamic import

                if (EntityClass) {
                    await generatePrismaModel(EntityClass, file, schemaPath);
                }
            } catch (err) {
                printError("Error extracting entity module", `${err}`);
            }
        });

        await Promise.all(promises);
    });

    await Promise.all(generatePromises);
}

async function codeFirstGen(): Promise<void> {
    // Load expressots.config.json
    const { sourceRoot, providers, opinionated } = await Compiler.loadConfig();
    const PROJECT_ROOT = `${process.cwd()}\\${sourceRoot}`;

    if (providers?.prisma) {
        const schemaPath = path.join(
            process.cwd(),
            providers?.prisma.schemaPath,
            `${providers.prisma.schemaName}.prisma`,
        );

        const entitiesPath = path.join(sourceRoot, providers.prisma.entitiesPath);
        const entityNamePattern = opinionated ? "entity" : providers.prisma.entityNamePattern;

        await readAllEntities(entitiesPath, schemaPath, entityNamePattern);
        await generatePrismaRelations(schemaPath, RELATIONS);
        await removeUnusedEnumsAndTypes(schemaPath);
        await removeModels(entitiesPath, schemaPath, entityNamePattern);
    }

    // Prisma tasks
    // Review: check when one of the processes gives an error when executing the other does not execute
    await execProcess({
        commandArg: "npx",
        args: ["prisma", "format"],
        directory: PROJECT_ROOT,
    });

    await execProcess({
        commandArg: "npx",
        args: ["prisma", "validate"],
        directory: PROJECT_ROOT,
    });

    // Review: this is the best solution?
    await execProcess({
        commandArg: "npx",
        args: ["prisma", "generate"],
        directory: PROJECT_ROOT,
    });
}

export { codeFirstGen };
