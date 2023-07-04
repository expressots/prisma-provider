export interface IPrismaRelationOptions {
    name?: string;
    relatedEntity?: string;
    fields: string[];
    references: string[];
}

export function prismaRelation(options: IPrismaRelationOptions): PropertyDecorator {
    return function (target: Object, propertyKey: string | symbol) {
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
        console.log(relations);
        Reflect.defineMetadata("prisma:relations", relations, target.constructor);
    };
}
