/**
 * Interface for defining options for Prisma relation.
 */
export interface IPrismaRelationOptions {
    /**
     * Optional name for the relation.
     */
    name?: string;

    /**
     * Optional related entity name for the relation.
     */
    relatedEntity?: string;

    /**
     * An array of field names in the relation.
     */
    fields: string[];

    /**
     * An array of reference names in the relation.
     */
    references: string[];
}

/**
 * Function to define a Prisma relation decorator.
 * @param {IPrismaRelationOptions} options - Options for the Prisma relation.
 */
export function prismaRelation(options: IPrismaRelationOptions): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        if (!Reflect.hasMetadata("prisma:relations", target.constructor)) {
            Reflect.defineMetadata("prisma:relations", [], target.constructor);
        }

        const relations = Reflect.getMetadata(
            "prisma:relations",
            target.constructor,
        ) as IPrismaRelationOptions[];
        const relation: IPrismaRelationOptions = {
            name: propertyKey.toString(),
            relatedEntity: options.relatedEntity || undefined,
            fields: options.fields,
            references: options.references,
        };

        relations.push(relation);
        Reflect.defineMetadata("prisma:relations", relations, target.constructor);
    };
}
