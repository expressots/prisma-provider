import "reflect-metadata";
import fs from "fs";
import path from "path";
import { IPrismaRelationOptions } from "../decorators/prisma-relation.decorator";
import { ClassInfo } from "../reflect";
import { getClassInfo, getDecorators } from "./model-generator";
import { printError } from "../../utils/better-error-message";

type Relationships = {
    fromEntity: string;
    toEntity: string;

    relationStringTo: string;
    relationStringFrom: string | undefined;

    newRowsTo: string[];
    newRowsFrom: string[];
};

async function createRelationships(
    relation: IPrismaRelationOptions,
    cls: any,
    filePath: string,
): Promise<Relationships | undefined> {
    // console.log("relations", relations);
    const fromClass: ClassInfo | undefined = getClassInfo(cls, filePath);
    if (!fromClass) {
        return undefined;
    }

    const classRelation = fromClass.properties.find((property) => {
        if (property.type === relation.model) {
            return property;
        }
    });

    const relationStringTo: string[] = [];
    const relationStringFrom: string[] = [];
    if (relation.name) {
        relationStringTo.push(`"${relation.name}"`);
        relationStringFrom.push(`"${relation.name}"`);
    }

    const fks = relation.FK ? relation.FK.length : -1;
    const pks = relation.PK.length;

    const formattedFK: string[] = [];
    if (fks === pks && relation.FK) {
        for (let i = 0; i < relation.FK.length; i++) {
            if (i === 0) {
                formattedFK.push(`${relation.model[0].toLowerCase() + relation.model.slice(1)}Id`);
            } else {
                formattedFK.push(`${relation.FK[i]}Id`);
            }
        }
        relationStringTo.push(`fields: [${formattedFK.join(", ")}]`);
    } else if (fks < pks) {
        for (let i = 0; i < relation.PK.length; i++) {
            if (i === 0) {
                formattedFK.push(`${relation.model[0].toLowerCase() + relation.model.slice(1)}Id`);
            } else {
                formattedFK.push(`${relation.PK[i]}Id`);
            }
        }
        relationStringTo.push(`fields: [${formattedFK.join(", ")}]`);
    } else if (fks > pks) {
        printError("Fk > Pks", `relation: ${relation.name}`);
        process.exit(1);
    }

    const newRowsTo: string[] = [];
    const newRowsFrom: string[] = [];
    if (classRelation?.pathDeclaration) {
        const module = await import(path.resolve(filePath));
        const entityClass = module[cls.name];
        const fromClass = getDecorators(entityClass);

        if (formattedFK.length > 1) {
            for (let i = 0; i < relation.PK.length && i < formattedFK.length; i++) {
                for (const field of fromClass.fields) {
                    if (field.name === relation.PK[i]) {
                        newRowsTo.push(`${formattedFK[i]} ${field.type}`);
                    }
                }
            }
            newRowsFrom.push(`@@unique([${relation.PK.join(", ")}])`);
            newRowsTo.push(`@@unique([${formattedFK.join(", ")}])`);
        } else {
            for (let i = 0; i < relation.PK.length && i < formattedFK.length; i++) {
                for (const field of fromClass.fields) {
                    if (field.name === relation.PK[i]) {
                        newRowsTo.push(`${formattedFK[i]} ${field.type} @unique`);
                    }
                }
            }
        }
    }

    if (relation.PK) {
        const formattedPK = relation.PK.join(", ");
        relationStringTo.push(`references: [${formattedPK}]`);
    }

    if (relation.map) {
        relationStringTo.push(`map: "${relation.map}"`);
    }

    if (relation.onDelete) {
        relationStringTo.push(`onDelete: ${relation.onDelete}`);
    }

    if (relation.onUpdate) {
        relationStringTo.push(`onUpdate: ${relation.onUpdate}`);
    }

    const relStringTo = `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)} ${
        fromClass.name
    } @relation(${relationStringTo.join(", ")})`;

    let relStringFrom: string | undefined = undefined;
    if (relationStringFrom.length > 0) {
        relStringFrom = `@relation(${relationStringFrom.join(", ")})`;
    }

    const relashionships: Relationships = {
        fromEntity: fromClass.name,
        toEntity: relation.model,
        relationStringTo: relStringTo,
        relationStringFrom: relStringFrom,
        newRowsTo,
        newRowsFrom,
    };

    return relashionships;
}

async function generatePrismaRelations(
    schemaPath: string,
    relations: Relationships[],
): Promise<void> {
    let schemaContent = fs.readFileSync(schemaPath, "utf-8");

    relations.forEach((relation) => {
        // Add new lines to the to entity
        const modelRegex = new RegExp(`(model\\s+${relation.toEntity}\\s+{[\\s\\S]*?})`, "g");
        const model = schemaContent.match(modelRegex);
        if (model) {
            const newModel = model[0].replace(
                "}",
                `${relation.relationStringTo}\n${relation.newRowsTo.join("\n")}\n}`,
            );
            schemaContent = schemaContent.replace(model[0], newModel);
        }

        // Add new lines to the from entity
        const modelRegex2 = new RegExp(`(model\\s+${relation.fromEntity}\\s+{[\\s\\S]*?})`, "g");
        const model2 = schemaContent.match(modelRegex2);
        if (model2) {
            if (relation.relationStringFrom) {
                const fieldRegex = new RegExp(
                    `(\\s+${relation.toEntity[0].toLowerCase() + relation.toEntity.slice(1)}\\s+${
                        relation.toEntity
                    })(.*)`,
                );
                const updatedSchemaContent = model2[0].replace(
                    fieldRegex,
                    `$1$2 ${relation.relationStringFrom}`,
                );

                schemaContent = schemaContent.replace(model2[0], updatedSchemaContent);
            }

            if (relation.newRowsFrom.length > 0) {
                const newModel2 = model2[0].replace("}", `${relation.newRowsFrom.join("\n")}\n}`);
                schemaContent = schemaContent.replace(model2[0], newModel2);
            }
        }
    });

    await fs.promises.writeFile(schemaPath, schemaContent);
}

export { createRelationships, Relationships, generatePrismaRelations };
