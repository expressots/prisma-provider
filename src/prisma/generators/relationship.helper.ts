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

    const relConstructor = {
        relationStringTo: [] as string[], // store the relation string for the to entity
        relationStringFrom: [] as string[], // store the relation of actual entity
        newRowsTo: [] as string[], // store the new rows for the to entity
        newRowsFrom: [] as string[], // store the new rows for the actual entity
    };

    // get from class the property that is the relation
    const classRelation = fromClass.properties.find((property) => {
        if (property.type.replace(/[\[\]?!]/g, "") === relationSettings.model) {
            return property;
        }
    });

    // Create fields for relation (OneToOne, OneToManny, ManyToMany Explicit).
    if (relationSettings.relation !== Relation.ManyToMany && relationSettings.refs) {
        // logic for create the foreign keys
        const fks = relationSettings.fields ? relationSettings.fields.length : -1;
        const pks = relationSettings.refs.length;

        const formattedFK: string[] = [];

        switch (relationSettings.relation) {
            case Relation.ManyToManyExplicit:
                if (fks === pks && relationSettings.fields) {
                    for (let i = 0; i < relationSettings.fields.length; i++) {
                        formattedFK.push(
                            i === 0
                                ? `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)}Id`
                                : `${relationSettings.fields[i]}Id`,
                        );
                    }
                } else if (fks < pks) {
                    for (let i = 0; i < relationSettings.refs.length; i++) {
                        formattedFK.push(
                            i === 0
                                ? `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)}Id`
                                : `${relationSettings.refs[i]}Id`,
                        );
                    }
                }
                break;
            default:
                if (fks === pks && relationSettings.fields) {
                    for (let i = 0; i < relationSettings.fields.length; i++) {
                        formattedFK.push(
                            i === 0
                                ? `${
                                      relationSettings.model[0].toLowerCase() +
                                      relationSettings.model.slice(1)
                                  }Id`
                                : `${relationSettings.fields[i]}Id`,
                        );
                    }
                } else if (fks < pks) {
                    for (let i = 0; i < relationSettings.refs.length; i++) {
                        formattedFK.push(
                            i === 0
                                ? `${
                                      relationSettings.model[0].toLowerCase() +
                                      relationSettings.model.slice(1)
                                  }Id`
                                : `${relationSettings.refs[i]}Id`,
                        );
                    }
                }
                break;
        }

        if (formattedFK.length > 0) {
            relConstructor.relationStringTo.push(`fields: [${formattedFK.join(", ")}]`);
        }

        if (classRelation?.pathDeclaration) {
            const module = await import(path.resolve(filePath));
            const entityClass = module[cls.name];
            const fromClass = getDecorators(entityClass);

            for (let i = 0; i < relationSettings.refs.length && i < formattedFK.length; i++) {
                for (const field of fromClass.fields) {
                    if (field.name === relationSettings.refs[i]) {
                        if (
                            (relationSettings.relation === Relation.OneToOne ||
                                relationSettings.relation === Relation.OneToMany) &&
                            relationSettings.isRequired === true
                        ) {
                            relConstructor.newRowsTo.push(
                                `${formattedFK[i]} ${field.type}? ${
                                    formattedFK.length > 1 ? "" : " @unique"
                                }`,
                            );
                        } else {
                            relConstructor.newRowsTo.push(
                                `${formattedFK[i]} ${field.type}${
                                    formattedFK.length > 1 ? "" : " @unique"
                                }`,
                            );
                        }
                    }
                }
            }

            if (formattedFK.length > 1) {
                relConstructor.newRowsFrom.push(`@@unique([${relationSettings.refs.join(", ")}])`);
                relConstructor.newRowsTo.push(`@@unique([${formattedFK.join(", ")}])`);
            }
        }
    }

    // Create refereces for relation (OneToOne, OneToManny, ManyToMany Explicit)
    if (relationSettings.relation !== Relation.ManyToMany) {
        if (relationSettings.refs) {
            const formattedPK = relationSettings.refs.join(", ");
            relConstructor.relationStringTo.push(`references: [${formattedPK}]`);
        } else {
            printError("You need to set refs for relation of type", `${relationSettings.relation}`);
            process.exit(1);
        }
    }

    // Create onDelete for relation (OneToOne, OneToManny, ManyToMany Explicit)
    if (relationSettings.onDelete) {
        relConstructor.relationStringTo.push(`onDelete: ${relationSettings.onDelete}`);
    }

    // Create onUpdate for relation (OneToOne, OneToManny, ManyToMany Explicit)
    if (relationSettings.onUpdate) {
        relConstructor.relationStringTo.push(`onUpdate: ${relationSettings.onUpdate}`);
    }

    let relStringTo: string | undefined = undefined;
    const relString = `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)} ${
        fromClass.name
    }`;

    if (relationSettings.relation !== Relation.ManyToMany) {
        if (
            (relationSettings.relation === Relation.OneToMany ||
                relationSettings.relation === Relation.OneToOne) &&
            relationSettings.isRequired === true
        ) {
            relStringTo = `${relString}?`;
        } else {
            relStringTo = relString;
        }
    } else {
        relStringTo = `${relString}[]`;
    }

    if (relConstructor.relationStringTo.length > 0) {
        relStringTo += ` @relation(${relConstructor.relationStringTo.join(", ")})`;
    }

    let relStringFrom: string | undefined = undefined;
    const modelString = `${
        relationSettings.model[0].toLowerCase() + relationSettings.model.slice(1)
    } ${relationSettings.model}`;

    if (relationSettings.relation === Relation.OneToMany) {
        relStringFrom =
            relConstructor.relationStringFrom.length > 0
                ? `${modelString}[] @relation(${relConstructor.relationStringFrom.join(", ")})`
                : `${modelString}[]`;
    } else if (relationSettings.relation === Relation.ManyToManyExplicit && classRelation) {
        const classRelName = classRelation?.name[0].toLowerCase() + classRelation?.name.slice(1);
        relStringFrom =
            relConstructor.relationStringFrom.length > 0
                ? `${classRelName} ${
                      relationSettings.model
                  }[] @relation(${relConstructor.relationStringFrom.join(", ")})`
                : `${classRelName} ${relationSettings.model}[]`;
    } else {
        relStringFrom =
            relConstructor.relationStringFrom.length > 0
                ? `${modelString}? @relation(${relConstructor.relationStringFrom.join(", ")})`
                : `${modelString}?`;
    }

    if (relationSettings.relation === Relation.ManyToMany) {
        relStringFrom =
            relConstructor.relationStringFrom.length > 0
                ? `${modelString} @relation(${relConstructor.relationStringFrom.join(", ")})`
                : modelString;
    }

    const relashionships: Relationships = {
        fromEntity: fromClass.name,
        toEntity: relationSettings.model,
        relationStringTo: relStringTo,
        relationStringFrom: relStringFrom,
        newRowsTo: relConstructor.newRowsTo,
        newRowsFrom: relConstructor.newRowsFrom,
        relationType: relationSettings.relation,
        classRelation: classRelation,
    };

    return relashionships;
}

async function generatePrismaRelations(
    schemaPath: string,
    relations: Relationships[],
): Promise<void> {
    relations.forEach(async (relation) => {
        let schemaContent = fs.readFileSync(schemaPath, "utf-8");
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

            if (relation.newRowsFrom.length > 0) {
                console.log(relation.newRowsFrom);
                console.log(fromEntity[0]);
                const newModel2 = fromEntity[0].replace(
                    "}",
                    `${relation.newRowsFrom.join("\n")}\n}`,
                );

                console.log(newModel2);
                schemaContent = schemaContent.replace(fromEntity[0], newModel2);
            }
        }
        await fs.promises.writeFile(schemaPath, schemaContent);
    });
}

export { createRelationships, Relationships, generatePrismaRelations };
