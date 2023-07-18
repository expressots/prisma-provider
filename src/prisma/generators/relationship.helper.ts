import "reflect-metadata";
import fs from "fs";
import path from "path";
import { IPrismaRelationOptions, Relation } from "../decorators/prisma-relation.decorator";
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
    const fromClass: ClassInfo | undefined = getClassInfo(cls, filePath);
    if (!fromClass) {
        return undefined;
    }

    // get from class the property that is the relation
    const classRelation = fromClass.properties.find((property) => {
        if (property.type === relation.model) {
            return property;
        }
    });

    const relationStringTo: string[] = []; // store the relation string for the to entity
    const relationStringFrom: string[] = []; // store the relation of actual entity
    const newRowsTo: string[] = []; // store the new rows for the to entity
    const newRowsFrom: string[] = []; // store the new rows for the actual entity

    // if relation name is defined
    if (relation.name) {
        relationStringTo.push(`"${relation.name}"`);
        relationStringFrom.push(`"${relation.name}"`);
    }

    if (relation.PK) {
        // logic for create the foreign keys
        const fks = relation.FK ? relation.FK.length : -1;
        const pks = relation.PK.length;

        // Create FK(fields) for relation (OneToOne, OneToManny, ManyToMany Explicit).
        if (relation.relation !== Relation.ManyToMany && relation.PK) {
            const formattedFK: string[] = [];
            if (fks === pks && relation.FK) {
                for (let i = 0; i < relation.FK.length; i++) {
                    if (i === 0) {
                        formattedFK.push(
                            `${relation.model[0].toLowerCase() + relation.model.slice(1)}Id`,
                        );
                    } else {
                        formattedFK.push(`${relation.FK[i]}Id`);
                    }
                }
                relationStringTo.push(`fields: [${formattedFK.join(", ")}]`);
            } else if (fks < pks) {
                for (let i = 0; i < relation.PK.length; i++) {
                    if (i === 0) {
                        formattedFK.push(
                            `${relation.model[0].toLowerCase() + relation.model.slice(1)}Id`,
                        );
                    } else {
                        formattedFK.push(`${relation.PK[i]}Id`);
                    }
                }
                relationStringTo.push(`fields: [${formattedFK.join(", ")}]`);
            } else if (fks > pks) {
                printError("Fk > Pks", `relation: ${relation.name}`);
                process.exit(1);
            }

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
        }
    }

    // Create PK(refereces) for relation (OneToOne, OneToManny, ManyToMany Explicit)
    if (relation.relation !== Relation.ManyToMany) {
        if (relation.PK) {
            const formattedPK = relation.PK.join(", ");
            relationStringTo.push(`references: [${formattedPK}]`);
        } else {
            printError("You need to set PK for relation of type", `${relation.relation}`);
            process.exit(1);
        }
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

    let relStringTo: string | undefined = undefined;
    if (relation.relation !== Relation.ManyToMany) {
        if (relationStringTo.length > 0) {
            relStringTo = `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)} ${
                fromClass.name
            } @relation(${relationStringTo.join(", ")})`;
        } else {
            relStringTo = `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)} ${
                fromClass.name
            }`;
        }
    } else {
        if (relationStringTo.length > 0) {
            relStringTo = `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)} ${
                fromClass.name
            }[] @relation(${relationStringTo.join(", ")})`;
        } else {
            relStringTo = `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)} ${
                fromClass.name
            }[]`;
        }
    }

    let relStringFrom: string | undefined = undefined;
    if (relation.relation !== Relation.ManyToMany) {
        if (relation.relation === Relation.OneToMany) {
            if (relationStringFrom.length > 0) {
                relStringFrom = `${relation.model[0].toLowerCase() + relation.model.slice(1)} ${
                    relation.model
                }[] @relation(${relationStringFrom.join(", ")})`;
            } else {
                relStringFrom = `${relation.model[0].toLowerCase() + relation.model.slice(1)} ${
                    relation.model
                }[]`;
            }
        } else {
            if (relationStringFrom.length > 0) {
                relStringFrom = `${relation.model[0].toLowerCase() + relation.model.slice(1)} ${
                    relation.model
                }? @relation(${relationStringFrom.join(", ")})`;
            } else {
                relStringFrom = `${relation.model[0].toLowerCase() + relation.model.slice(1)} ${
                    relation.model
                }?`;
            }
        }
    } else {
        if (relationStringFrom.length > 0) {
            relStringFrom = `${relation.model[0].toLowerCase() + relation.model.slice(1)} ${
                relation.model
            }[] @relation(${relationStringFrom.join(", ")})`;
        } else {
            relStringFrom = `${relation.model[0].toLowerCase() + relation.model.slice(1)} ${
                relation.model
            }[]`;
        }
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
        const toEntity = schemaContent.match(modelRegex);

        if (toEntity) {
            const newModel = toEntity[0].replace(
                "}",
                `${relation.relationStringTo}\n${relation.newRowsTo.join("\n")}\n}`,
            );
            schemaContent = schemaContent.replace(toEntity[0], newModel);
        }

        // Add new lines to the from entity
        const modelRegex2 = new RegExp(`(model\\s+${relation.fromEntity}\\s+{[\\s\\S]*?})`, "g");
        const fromEntity = schemaContent.match(modelRegex2);
        if (fromEntity) {
            if (relation.relationStringFrom) {
                const fieldRegex = new RegExp(
                    `(\\s+${relation.toEntity[0].toLowerCase() + relation.toEntity.slice(1)}\\s+${
                        relation.toEntity
                    })(.*)`,
                );
                const updatedSchemaContent = fromEntity[0].replace(
                    fieldRegex,
                    `\n${relation.relationStringFrom}`,
                );

                schemaContent = schemaContent.replace(fromEntity[0], updatedSchemaContent);
            }

            if (relation.newRowsFrom.length > 0) {
                const newModel2 = fromEntity[0].replace(
                    "}",
                    `${relation.newRowsFrom.join("\n")}\n}`,
                );
                schemaContent = schemaContent.replace(fromEntity[0], newModel2);
            }
        }
    });

    await fs.promises.writeFile(schemaPath, schemaContent);
}

export { createRelationships, Relationships, generatePrismaRelations };
