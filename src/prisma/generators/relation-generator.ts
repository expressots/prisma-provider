import "reflect-metadata";
import fs from "fs";
import path from "path";
import { ClassInfo, PropertyInfo } from "../reflect";
import { Decorator, getClassInfo, getDecorators } from "./model-generator";
import { printError } from "../../utils/better-error-message";
import { IPrismaRelationOptions, Relation } from "../decorators/prisma-relation.decorator";

type Relationships = {
    fromEntity: string;
    toEntity: string;

    relationStringTo: string;
    relationStringFrom: string | undefined;

    newRowsTo: Array<string>;
    newRowsFrom: Array<string>;

    relationType: Relation;
    classRelation: PropertyInfo | undefined;
};

type RelationsObject = {
    relationStringTo: Array<string>; // store the relation string for the to entity
    relationStringFrom: Array<string>; // store the relation of actual entity
    newRowsTo: Array<string>; // store the new rows for the to entity
    newRowsFrom: Array<string>; // store the new rows for the actual entity
    formattedFields: Array<string>;
};

function addNamingOnRelation(
    relationSettings: IPrismaRelationOptions,
    relationsObject: RelationsObject,
) {
    if (relationSettings.name) {
        relationsObject.relationStringTo.push(`"${relationSettings.name}"`);
        relationsObject.relationStringFrom.push(`"${relationSettings.name}"`);
    }
}

function AddDeleteActionOnRelation(
    relationSettings: IPrismaRelationOptions,
    relationsObject: RelationsObject,
) {
    if (relationSettings.onDelete) {
        relationsObject.relationStringTo.push(`onDelete: ${relationSettings.onDelete}`);
    }
}

function AddUpdateActionOnRelation(
    relationSettings: IPrismaRelationOptions,
    relationsObject: RelationsObject,
) {
    if (relationSettings.onUpdate) {
        relationsObject.relationStringTo.push(`onUpdate: ${relationSettings.onUpdate}`);
    }
}

function AddReferencesOnRelation(
    relationSettings: IPrismaRelationOptions,
    relationsObject: RelationsObject,
) {
    if (relationSettings.refs) {
        relationsObject.relationStringTo.push(`references: [${relationSettings.refs.join(", ")}]`);
    } else {
        printError("You need to set refs for relation of type", `${relationSettings.relation}`);
        process.exit(1);
    }
}

function AddRelationStringToOnRelation(
    relationSettings: IPrismaRelationOptions,
    relationsObject: RelationsObject,
    fromClass: ClassInfo,
): string {
    const relationStringTo =
        relationsObject.relationStringTo.length > 0
            ? ` @relation(${relationsObject.relationStringTo.join(", ")})`
            : "";

    if (relationSettings.relation === Relation.ManyToMany) {
        return `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)} ${
            fromClass.name
        }[]${relationStringTo}`;
    }

    const isRequired = relationSettings.isRequired ? "" : "?";
    return `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)} ${
        fromClass.name
    }${isRequired}${relationStringTo}`;
}

async function AddNewRowsOnRelation(
    relationSettings: IPrismaRelationOptions,
    relationsObject: RelationsObject,
    fromClassDecorators: Decorator,
) {
    if (!relationSettings.refs) {
        printError("You need to set refs for relation of type", `${relationSettings.relation}`);
        process.exit(1);
    }

    for (let i = 0; i < relationsObject.formattedFields.length; i++) {
        for (const field of fromClassDecorators.fields) {
            if (field.name === relationSettings.refs[i]) {
                const isRequired =
                    relationSettings.relation === Relation.OneToOne ||
                    relationSettings.relation === Relation.OneToMany
                        ? relationSettings.isRequired === true
                        : false;

                const newRowTo = `${relationsObject.formattedFields[i]} ${field.type}${
                    isRequired ? "" : "?"
                }${relationsObject.formattedFields.length > 1 ? "" : " @unique"}`;

                relationsObject.newRowsTo.push(newRowTo);
            }
        }
    }

    if (relationsObject.formattedFields.length > 1) {
        relationsObject.newRowsFrom.push(`@@unique([${relationSettings.refs.join(", ")}])`);
        relationsObject.newRowsTo.push(`@@unique([${relationsObject.formattedFields.join(", ")}])`);
    }
}

function AddFieldsOnRelation(
    relationSettings: IPrismaRelationOptions,
    relationsObject: RelationsObject,
    fromClass: ClassInfo,
) {
    if (!relationSettings.refs) {
        printError(
            "You need to set refs for relation of type",
            `relation: ${relationSettings.name}`,
        );
        process.exit(1);
    }

    const refsLength = relationSettings.refs.length;
    // Check if have fields and if fields have the same length as refs and only add the fields if the relation is not ManyToMany
    if (relationSettings.fields) {
        const fieldsLength = relationSettings.fields.length;
        // Check for consistency between fields and refs
        if (fieldsLength && fieldsLength !== refsLength) {
            printError(
                "When adding elements in fields they must contain the same number of elements as refs",
                `relation: ${relationSettings.name}`,
            );
            process.exit(1);
        }
        for (let i = 0; i < fieldsLength; i++) {
            relationsObject.formattedFields.push(`${relationSettings.fields[i]}`);
        }
    } else {
        // If fields is not set, create the fields based on the refs
        for (let i = 0; i < refsLength; i++) {
            if (i === 0) {
                relationsObject.formattedFields.push(
                    `${fromClass.name[0].toLowerCase() + fromClass.name.slice(1)}Id`,
                );
            } else {
                relationsObject.formattedFields.push(`${relationSettings.refs[i]}Id`);
            }
        }
    }

    relationsObject.relationStringTo.push(
        `fields: [${relationsObject.formattedFields.join(", ")}]`,
    );
}

async function createRelationships(
    relationSettings: IPrismaRelationOptions,
    cls: any,
    filePath: string,
): Promise<Relationships | undefined> {
    const fromClass: ClassInfo | undefined = getClassInfo(cls, filePath);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tsNode = require("ts-node");
    tsNode.register({
        transpileOnly: true, // Only transpile, don't type-check
        compilerOptions: {
            target: "ESNext", // Target version
            module: "CommonJS", // Output module format
        },
    });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { [cls.name]: entityClass } = require(path.resolve(filePath)); // Use the dynamic import
    const fromClassDecorators = getDecorators(entityClass);

    if (!fromClass) {
        return undefined;
    }

    const relationsObject: RelationsObject = {
        relationStringTo: [],
        relationStringFrom: [],
        newRowsTo: [],
        newRowsFrom: [],
        formattedFields: [],
    };

    const classRelation = fromClass.properties.find(
        (property) => property.type.replace(/[\[\]?!]/g, "") === relationSettings.model,
    );

    if (!classRelation) {
        printError("Relation type not found in the class", `relation: ${relationSettings.name}`);
        process.exit(1);
    }

    addNamingOnRelation(relationSettings, relationsObject); // name
    if (relationSettings.relation !== Relation.ManyToMany) {
        AddFieldsOnRelation(relationSettings, relationsObject, fromClass); // fields
        AddNewRowsOnRelation(relationSettings, relationsObject, fromClassDecorators); // new rows for the to entity
        AddReferencesOnRelation(relationSettings, relationsObject); // refs
    }
    AddDeleteActionOnRelation(relationSettings, relationsObject); // onDelete
    AddUpdateActionOnRelation(relationSettings, relationsObject); // onUpdate

    // Construct relation strings based on relation type
    const relStringTo: string | undefined = AddRelationStringToOnRelation(
        relationSettings,
        relationsObject,
        fromClass,
    );

    let relStringFrom: string | undefined = undefined;
    const modelNameLower =
        relationSettings.model[0].toLowerCase() + relationSettings.model.slice(1);

    switch (relationSettings.relation) {
        case Relation.OneToOne:
            relStringFrom = `${modelNameLower} ${relationSettings.model}?`;
            break;
        case Relation.OneToMany:
        case Relation.ManyToMany:
            relStringFrom = `${modelNameLower} ${relationSettings.model}[]`;
            break;
        case Relation.ManyToManyExplicit:
            if (classRelation) {
                relStringFrom = `${
                    classRelation.name[0].toLowerCase() + classRelation.name.slice(1)
                } ${relationSettings.model}[]`;
            }
            break;
    }

    if (
        relationSettings.relation !== Relation.OneToMany &&
        relationsObject.relationStringFrom.length > 0
    ) {
        relStringFrom += ` @relation(${relationsObject.relationStringFrom.join(", ")})`;
    }

    const relationships: Relationships = {
        fromEntity: fromClass.name,
        toEntity: relationSettings.model,
        relationStringTo: relStringTo,
        relationStringFrom: relStringFrom,
        newRowsTo: relationsObject.newRowsTo,
        newRowsFrom: relationsObject.newRowsFrom,
        relationType: relationSettings.relation,
        classRelation: classRelation,
    };

    return relationships;
}

async function generatePrismaRelations(
    schemaPath: string,
    relations: Array<Relationships>,
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

        const modelRegex2 = new RegExp(`(model\\s+${relation.fromEntity}\\s+{[\\s\\S]*?})`, "g");
        const fromEntity = schemaContent.match(modelRegex2);

        if (fromEntity && relation.relationStringFrom) {
            const fieldRegex = new RegExp(
                `(\\s+${
                    relation.relationType === Relation.ManyToManyExplicit && relation.classRelation
                        ? relation.classRelation.name[0].toLowerCase() +
                          relation.classRelation.name.slice(1)
                        : relation.toEntity[0].toLowerCase() + relation.toEntity.slice(1)
                } ${relation.toEntity})(.*)`,
            );

            const updatedSchemaContent = fromEntity[0].replace(
                fieldRegex,
                `\n${relation.relationStringFrom}`,
            );

            schemaContent = schemaContent.replace(fromEntity[0], updatedSchemaContent);
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
