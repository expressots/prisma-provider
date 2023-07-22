import "reflect-metadata";
import fs from "fs";
import path from "path";
import { ClassInfo, PropertyInfo } from "../reflect";
import { getClassInfo, getDecorators } from "./model-generator";
import { printError } from "../../utils/better-error-message";
import { IPrismaRelationOptions, Relation } from "../decorators/prisma-relation.decorator";

type Relationships = {
    fromEntity: string;
    toEntity: string;

    relationStringTo: string;
    relationStringFrom: string | undefined;

    newRowsTo: string[];
    newRowsFrom: string[];

    relationType: Relation;
    classRelation: PropertyInfo | undefined;
};

async function createRelationships(
    relationSettings: IPrismaRelationOptions,
    cls: any,
    filePath: string,
): Promise<Relationships | undefined> {
    // get the class info from the class
    const fromClass: ClassInfo | undefined = getClassInfo(cls, filePath);
    if (!fromClass) {
        return undefined;
    }

    const relationStringTo: string[] = []; // store the relation string for the to entity
    const relationStringFrom: string[] = []; // store the relation of actual entity
    const newRowsTo: string[] = []; // store the new rows for the to entity
    const newRowsFrom: string[] = []; // store the new rows for the actual entity

    // get from class the property that is the relation
    const classRelation = fromClass.properties.find((property) => {
        if (property.type.replace(/[\[\]?!]/g, "") === relationSettings.model) {
            return property;
        }
    });

    if (relationSettings.name) {
        relationStringTo.push(`"${relationSettings.name}"`);
        relationStringFrom.push(`"${relationSettings.name}"`);
    }

    if (relationSettings.refs) {
        // logic for create the foreign keys
        const fieldsLength = relationSettings.fields?.length;
        const refsLength = relationSettings.refs.length;

        if (fieldsLength && fieldsLength < refsLength) {
            printError(
                "When adding elements in fields they must contain the same number of elements as refs",
                `relation: ${relationSettings.name}`,
            );
            process.exit(1);
        } else if (fieldsLength && fieldsLength > refsLength) {
            printError(
                "Number of elements in fields more than refs",
                `relation: ${relationSettings.name}`,
            );
            process.exit(1);
        }
        // Create FK(fields) for relation (OneToOne, OneToManny, ManyToMany Explicit).
        if (relationSettings.relation !== Relation.ManyToMany && relationSettings.refs) {
            const formattedFK: string[] = [];
            if (
                fieldsLength === refsLength &&
                relationSettings.fields &&
                relationSettings.relation !== Relation.ManyToManyExplicit
            ) {
                for (let i = 0; i < relationSettings.fields.length; i++) {
                    formattedFK.push(`${relationSettings.fields[i]}Id`);
                }
                relationStringTo.push(`fields: [${formattedFK.join(", ")}]`);
            } else if (
                !relationSettings.fields &&
                relationSettings.relation !== Relation.ManyToManyExplicit
            ) {
                for (let i = 0; i < relationSettings.refs.length; i++) {
                    if (i === 0) {
                        formattedFK.push(
                            `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)}Id`,
                        );
                    } else {
                        formattedFK.push(`${relationSettings.refs[i]}Id`);
                    }
                }
                relationStringTo.push(`fields: [${formattedFK.join(", ")}]`);
            } else if (
                fieldsLength === refsLength &&
                relationSettings.fields &&
                relationSettings.relation === Relation.ManyToManyExplicit
            ) {
                for (let i = 0; i < relationSettings.refs.length; i++) {
                    formattedFK.push(`${relationSettings.refs[i]}Id`);
                }
                relationStringTo.push(`fields: [${formattedFK.join(", ")}]`);
            } else if (
                !relationSettings.fields &&
                relationSettings.relation === Relation.ManyToManyExplicit
            ) {
                for (let i = 0; i < relationSettings.refs.length; i++) {
                    if (i === 0) {
                        formattedFK.push(
                            `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)}Id`,
                        );
                    } else {
                        formattedFK.push(`${relationSettings.refs[i]}Id`);
                    }
                }
                relationStringTo.push(`fields: [${formattedFK.join(", ")}]`);
            }

            if (classRelation?.pathDeclaration) {
                const module = await import(path.resolve(filePath));
                const entityClass = module[cls.name];
                const fromClass = getDecorators(entityClass);

                if (formattedFK.length > 1) {
                    for (let i = 0; i < formattedFK.length; i++) {
                        for (const field of fromClass.fields) {
                            if (field.name === relationSettings.refs[i]) {
                                newRowsTo.push(`${formattedFK[i]} ${field.type}`);
                            }
                        }
                    }
                    newRowsFrom.push(`@@unique([${relationSettings.refs.join(", ")}])`);
                    newRowsTo.push(`@@unique([${formattedFK.join(", ")}])`);
                } else {
                    for (let i = 0; i < formattedFK.length; i++) {
                        for (const field of fromClass.fields) {
                            if (field.name === relationSettings.refs[i]) {
                                if (
                                    (relationSettings.relation === Relation.OneToOne ||
                                        relationSettings.relation === Relation.OneToMany) &&
                                    relationSettings.isRequired === true
                                ) {
                                    newRowsTo.push(
                                        `${formattedFK[i]} ${field.type}? ${
                                            formattedFK.length > 1 ? "" : " @unique"
                                        }`,
                                    );
                                } else {
                                    newRowsTo.push(
                                        `${formattedFK[i]} ${field.type}${
                                            formattedFK.length > 1 ? "" : " @unique"
                                        }`,
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Create refereces for relation (OneToOne, OneToManny, ManyToMany Explicit)
    if (relationSettings.relation !== Relation.ManyToMany) {
        if (relationSettings.refs) {
            const formattedPK = relationSettings.refs.join(", ");
            relationStringTo.push(`references: [${formattedPK}]`);
        } else {
            printError("You need to set refs for relation of type", `${relationSettings.relation}`);
            process.exit(1);
        }
    }

    // Create onDelete for relation (OneToOne, OneToManny, ManyToMany Explicit)
    if (relationSettings.onDelete) {
        relationStringTo.push(`onDelete: ${relationSettings.onDelete}`);
    }

    // Create onUpdate for relation (OneToOne, OneToManny, ManyToMany Explicit)
    if (relationSettings.onUpdate) {
        relationStringTo.push(`onUpdate: ${relationSettings.onUpdate}`);
    }

    let relStringTo: string | undefined = undefined;
    if (relationSettings.relation !== Relation.ManyToMany) {
        if (relationSettings.isRequired === true) {
            if (relationStringTo.length > 0) {
                relStringTo = `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)} ${
                    fromClass.name
                }? @relation(${relationStringTo.join(", ")})`;
            } else {
                relStringTo = `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)} ${
                    fromClass.name
                }?`;
            }
        } else {
            if (relationStringTo.length > 0) {
                relStringTo = `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)} ${
                    fromClass.name
                } @relation(${relationStringTo.join(", ")})`;
            } else {
                relStringTo = `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)} ${
                    fromClass.name
                }`;
            }
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
    if (relationSettings.relation !== Relation.ManyToMany) {
        if (relationSettings.relation === Relation.OneToMany) {
            if (relationStringFrom.length > 0) {
                relStringFrom = `${
                    relationSettings.model[0].toLowerCase() + relationSettings.model.slice(1)
                } ${relationSettings.model}[] @relation(${relationStringFrom.join(", ")})`;
            } else {
                relStringFrom = `${
                    relationSettings.model[0].toLowerCase() + relationSettings.model.slice(1)
                } ${relationSettings.model}[]`;
            }
        } else if (relationSettings.relation === Relation.ManyToManyExplicit && classRelation) {
            if (relationStringFrom.length > 0) {
                relStringFrom = `${
                    classRelation?.name[0].toLowerCase() + classRelation?.name.slice(1)
                } ${relationSettings.model}[] @relation(${relationStringFrom.join(", ")})`;
            } else {
                relStringFrom = `${
                    classRelation?.name[0].toLowerCase() + classRelation?.name.slice(1)
                } ${relationSettings.model}[]`;
            }
        } else {
            if (relationStringFrom.length > 0) {
                relStringFrom = `${
                    relationSettings.model[0].toLowerCase() + relationSettings.model.slice(1)
                } ${relationSettings.model}? @relation(${relationStringFrom.join(", ")})`;
            } else {
                relStringFrom = `${
                    relationSettings.model[0].toLowerCase() + relationSettings.model.slice(1)
                } ${relationSettings.model}?`;
            }
        }
    } else {
        if (relationStringFrom.length > 0) {
            relStringFrom = `${
                relationSettings.model[0].toLowerCase() + relationSettings.model.slice(1)
            } ${relationSettings.model}[] @relation(${relationStringFrom.join(", ")})`;
        } else {
            relStringFrom = `${
                relationSettings.model[0].toLowerCase() + relationSettings.model.slice(1)
            } ${relationSettings.model}[]`;
        }
    }

    const relashionships: Relationships = {
        fromEntity: fromClass.name,
        toEntity: relationSettings.model,
        relationStringTo: relStringTo,
        relationStringFrom: relStringFrom,
        newRowsTo: newRowsTo,
        newRowsFrom: newRowsFrom,
        relationType: relationSettings.relation,
        classRelation: classRelation,
    };

    return relashionships;
}

async function generatePrismaRelations(
    schemaPath: string,
    relations: Relationships[],
): Promise<void> {
    let schemaContent = fs.readFileSync(schemaPath, "utf-8");
    relations.forEach(async (relation) => {
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
                if (
                    relation.relationType === Relation.ManyToManyExplicit &&
                    relation.classRelation
                ) {
                    const fieldRegex = new RegExp(
                        `(\\s+${
                            relation.classRelation?.name[0].toLowerCase() +
                            relation.classRelation?.name.slice(1)
                        } ${relation.toEntity})(.*)`,
                    );
                    const updatedSchemaContent = fromEntity[0].replace(
                        fieldRegex,
                        `\n${relation.relationStringFrom}`,
                    );
                    schemaContent = schemaContent.replace(fromEntity[0], updatedSchemaContent);
                } else {
                    const fieldRegex = new RegExp(
                        `(\\s+${
                            relation.toEntity[0].toLowerCase() + relation.toEntity.slice(1)
                        }\\s+${relation.toEntity})(.*)`,
                    );
                    const updatedSchemaContent = fromEntity[0].replace(
                        fieldRegex,
                        `\n${relation.relationStringFrom}`,
                    );
                    schemaContent = schemaContent.replace(fromEntity[0], updatedSchemaContent);
                }
            }
        }

        const modelRegex3 = new RegExp(`(model\\s+${relation.fromEntity}\\s+{[\\s\\S]*?})`, "g");
        const fromEntity1 = schemaContent.match(modelRegex3);
        if (fromEntity1 && relation.newRowsFrom.length > 0) {
            const newModel2 = fromEntity1[0].replace("}", `${relation.newRowsFrom.join("\n")}\n}`);
            schemaContent = schemaContent.replace(fromEntity1[0], newModel2);
        }
    });
    await fs.promises.writeFile(schemaPath, schemaContent);
}

export { createRelationships, Relationships, generatePrismaRelations };
