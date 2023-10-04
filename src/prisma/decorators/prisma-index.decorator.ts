/**
 * Enum representing different types of indexes.
 */
export enum IndexType {
    Brin = "Brin",
    Btree = "BTree",
    Gist = "Gist",
    Gin = "Gin",
    Hash = "Hash",
    Spgist = "Spgist",
}

/**
 * Interface defining the options for Prisma index.
 * @template T - The type of fields in the index.
 */
export interface IPrismaIndexOptions<T = any> {
    /**
     * Array of field names for the index.
     */
    fields: Array<string>;

    /**
     * Optional map name for the index.
     */
    map?: string | undefined;

    /**
     * Optional name for the index.
     */
    name?: string | undefined;

    /**
     * Optional type for the index.
     */
    type?: IndexType | undefined;
}

/**
 * Function to define a Prisma index decorator.
 * @template T - The type of fields in the index.
 * @param { IPrismaIndexOptions } options - Options for the Prisma index.
 */
export function prismaIndex<T = any>(
    options: IPrismaIndexOptions<T>,
): ClassDecorator & PropertyDecorator {
    return function (target: object, propertyKey?: string | symbol) {
        if (propertyKey) {
            const indexOptions =
                (Reflect.getMetadata(
                    "prisma:index",
                    target.constructor,
                ) as Array<IPrismaIndexOptions>) || [];
            const indexOption: IPrismaIndexOptions = {
                fields: options.fields,
                map: options.map,
                name: options.name,
                type: options.type,
            };
            indexOptions.push(indexOption);
            Reflect.defineMetadata("prisma:index", indexOptions, target.constructor);
        } else {
            if (!Reflect.hasMetadata("prisma:index", target)) {
                Reflect.defineMetadata("prisma:index", [], target.constructor);
            }

            const indexOptions =
                (Reflect.getMetadata("prisma:index", target) as Array<IPrismaIndexOptions>) || [];
            const indexOption: IPrismaIndexOptions = {
                fields: options.fields,
                map: options.map,
                name: options.name,
                type: options.type,
            };

            indexOptions.push(indexOption);
            Reflect.defineMetadata("prisma:index", indexOptions, target);
        }
    };
}
