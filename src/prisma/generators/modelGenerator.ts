import fs from "fs";
import glob from "glob";
import path from "path";
import { IPrismaFieldOptions, IPrismaModelOptions } from "../decorators";
import { IPrismaIndexOptions } from "../decorators/index.decorator";
import { reflect } from "../reflect/reflect";
import { FileInfo } from "../reflect/file-info";
import { ClassExtractor } from "../reflect/extractor/class-extractor";
import typeSearcher from "../../utils/typeSearcher";
import removeUnusedEnumsAndTypes from "../../utils/removeUnusedEnumsAndTypes";
import { execProcess } from "../../utils/execProcess";
import Compiler from "../../utils/compiler";
import { printError, printReason } from "../../utils/betterErrorMessage";

async function generatePrismaModel(cls: any, filePath: string, schemaPath: string): Promise<void> {
    const reflectInfo: FileInfo[] = reflect({ fileArray: [filePath] });
    const model = (Reflect.getMetadata("prisma:model", cls) as IPrismaModelOptions) || false;
    const indexOptions = (Reflect.getMetadata("prisma:index", cls) as IPrismaIndexOptions[]) || [];

    if (model) {
        const className = cls.name;
        const fields = (Reflect.getMetadata("prisma:fields", cls) as IPrismaFieldOptions[]) || [];
        const classInfo = ClassExtractor.byName(ClassExtractor.classes(reflectInfo), className);

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
                fieldString += ` @default(${prismaDefault})`;
            }

            if (mapField) {
                fieldString += ` @map("${mapField}")`;
            }

            return fieldString;
        });

        const modelString = `model ${className} {\n  ${fieldStrings.join("\n  ")}\n}`;

        const schemaContent = fs.readFileSync(schemaPath, "utf-8");

        // REVIEW: see if is better form to get the provider
        const regex = /datasource\s+db\s+{\s+provider\s*=\s*"(.+)"\s+url\s*=\s*".*"\s+}/;
        const matcheProvider = schemaContent.match(regex);
        let providerValue = "";
        if (matcheProvider) {
            providerValue = matcheProvider[1];
        }

        const modelRegex = new RegExp(`(model ${className} {[^}]*})`, "g");
        const modelExists = modelRegex.test(schemaContent);

        let updatedContent;
        if (modelExists) {
            // Update the existing model
            updatedContent = schemaContent.replace(modelRegex, modelString);
        } else {
            // REVIEW: See if we are going to use the [Model] or not
            // Add the new model after the [Models] comment
            // updatedContent = schemaContent.replace("// [Models]", `// [Models]\n\n${modelString}`);
            updatedContent = `${schemaContent}\n\n${modelString}`;
        }

        // Join the idFields with comma separation and add them as a new fieldString if there's more than one id field
        if (idFields.length > 1) {
            const idFieldsString = `@@id([${idFields.join(", ")}])`;
            const modelRegex = new RegExp(`(model ${className} {[^}]*)`, "g");
            updatedContent = updatedContent.replace(modelRegex, `$1\n  ${idFieldsString}\n`);
        } else if (idFields.length === 1) {
            // BUG: when we have two classes with the same field name, it will add the @id annotation to both
            const regexPattern = `model\\s+${className}\\s+{[^}]*?${idFields[0]}\\s+\\w+[^}]*}`;
            const regex = new RegExp(regexPattern);
            // Realizar o replace do valor do campo
            updatedContent = updatedContent.replace(regex, (match) => {
                return match.replace(new RegExp(`(${idFields[0]} [A-Za-z]*)`), `$1 @id`);
            });

            // updatedContent = updatedContent.replace(
            // new RegExp(`(${idFields[0]} [A-Za-z]*)`),
            // `$1 @id`
            // )
        }

        // Join the uniqueFields with comma separation and add them as a new fieldString if there's more than one unique field
        if (uniqueFields.length > 1) {
            const uniqueFieldsString = `@@unique([${uniqueFields.join(", ")}])`;
            const modelRegex = new RegExp(`(model ${className} {[^}]*)`, "g");
            updatedContent = updatedContent.replace(modelRegex, `$1\n  ${uniqueFieldsString}\n`);
        } else if (uniqueFields.length === 1) {
            // BUG: when we have two classes with the same field name, it will add the @unique annotation to both
            const regexPattern = `model\\s+${className}\\s+{[^}]*?${idFields[0]}\\s+\\w+[^}]*}`;
            const regex = new RegExp(regexPattern);
            // Realizar o replace do valor do campo
            updatedContent = updatedContent.replace(regex, (match) => {
                return match.replace(new RegExp(`(${uniqueFields[0]} [A-Za-z]*)`), `$1 @unique`);
            });

            // updatedContent = updatedContent.replace(
            // new RegExp(`(${uniqueFields[0]} [A-Za-z]*)`),
            // `$1 @unique`
            // )
        }

        // Add @@map model annotation
        if (model.map) {
            const modelRegex = new RegExp(`(model ${className} {[^}]*)`, "g");
            updatedContent = updatedContent.replace(modelRegex, `$1\n  @@map("${model.map}")\n`);
        }

        // Add @@index model annotation
        if (indexOptions) {
            for (const index of indexOptions) {
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
        const providersNotSuportEnum = ["sqlserver", "sqlite"];
        const providersSuportTypes = ["mongodb"];

        if (classInfo) {
            for (const property of classInfo?.properties) {
                if (property.pathDeclaration && property.pathDeclaration !== "") {
                    const type = property.type.replace(/[\[\]?!]/g, "");
                    const field = fields.find((field) => field.name === property.name);
                    // if property is not a prisma field, skip
                    if (!field) {
                        continue;
                    }
                    const value = typeSearcher(type, property.pathDeclaration);
                    if (value) {
                        if (value?.includes("enum")) {
                            if (providersNotSuportEnum.includes(providerValue)) {
                                printError(`The Provider ${providerValue} not suport enums`, type);
                                continue;
                            }
                            const enumRegex = new RegExp(value, "g");
                            const enumExists = enumRegex.test(schemaContent);
                            if (enumExists) {
                                updatedContent = updatedContent.replace(enumRegex, value);
                            } else {
                                // REVIEW: See if we are going to use the [Enums] or not
                                // updatedContent = updatedContent.replace("// [Enums]", `// [Enums]\n\n${value}`);
                                updatedContent = `${updatedContent}\n\n${value}`;
                            }
                        } else if (value?.includes("type")) {
                            if (!providersSuportTypes.includes(providerValue)) {
                                printError(`The Provider ${providerValue} not suport types`, type);
                                continue;
                            }
                            const typeRegex = new RegExp(value, "g");
                            const typeExists = typeRegex.test(schemaContent);
                            if (typeExists) {
                                updatedContent = updatedContent.replace(typeRegex, value);
                            } else {
                                // REVIEW: See if we are going to use the [Types] or not
                                // updatedContent = updatedContent.replace("// [Types]", `// [Types]\n\n${value}`);
                                updatedContent = `${updatedContent}\n\n${value}`;
                            }
                        }
                    }
                }
            }
        }

        fs.writeFileSync(schemaPath, updatedContent);
        // remove model if not decorated
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
    const files = glob.sync(`${entitiesPath}/**/*.${entityNamePattern}.ts`);

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
        const fileContent = fs.readFileSync(file, "utf-8");
        const classRegex = new RegExp("(?<!\\/\\/.*\\n)class\\s+(\\w+)", "g");
        const classNameMatch = [...fileContent.matchAll(classRegex)];

        if (classNameMatch.length === 0) {
            printError("Could not find class declarations in the file", `${file}`);
            return;
        }

        for (const match of classNameMatch) {
            const className = match[1];

            try {
                const module = await import(path.resolve(file));
                const entityClass = module[className];

                if (!entityClass) {
                    continue;
                }

                await generatePrismaModel(entityClass, file, schemaPath);
            } catch (err) {
                printError("Error extracting entity module", `${err}`);
            }
        }
    });

    await Promise.all(generatePromises);
}

async function codeFirstGen(): Promise<void> {
    // Load expressots.config.json
    const { sourceRoot, providers, opinionated } = await Compiler.loadConfig();
    const PROJECT_ROOT = `${process.cwd()}\\${sourceRoot}`;

    if (providers?.Prisma) {
        const schemaPath = path.join(
            PROJECT_ROOT,
            providers?.Prisma.schemaPath,
            providers.Prisma.schemaName,
        );
        const entitiesPath = path.join(PROJECT_ROOT, providers.Prisma.entitiesPath);
        const entityNamePattern = opinionated ? "entity" : providers.Prisma.entityNamePattern;

        await readAllEntities(entitiesPath, schemaPath, entityNamePattern);
        await removeUnusedEnumsAndTypes(schemaPath);
    }

    // Prisma tasks
    // Review: check when one of the processes gives an error when executing the other does not execute
    await execProcess({
        commandArg: "npx",
        args: ["prisma", "validate"],
        directory: PROJECT_ROOT,
    });

    await execProcess({
        commandArg: "npx",
        args: ["prisma", "format"],
        directory: PROJECT_ROOT,
    });
}

export { codeFirstGen };
