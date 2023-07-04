import { type } from "../types/scalar.types";
import { db } from "../types/db-type-specific";

/**
 * Available default options for Prisma fields
 */
export const Default = {
    Auto: "auto()",
    AutoIncrement: "autoincrement()",
    Sequence: "sequence()",
    Cuid: "cuid()",
    Uuid: "uuid()",
    Now: "now()",
    DBgenerated: "dbgenerated()",
    /**
     * Function to set a default value for a Prisma field.
     * If the value is a string, it will be wrapped in quotes.
     * @param {any} value - the default value for the field
     */
    Value: (value: any) => (typeof value === "string" ? `"${value}"` : value),
};

/**
 * Interface for options that can be passed to a Prisma field.
 */
export interface IPrismaFieldOptions<T = any> {
    type?: type | object | string;
    attr?: typeof db | string;
    isId?: boolean;
    isOptional?: boolean;
    isUnique?: boolean;
    prismaDefault?: typeof Default | string;
    mapField?: string;
    name?: string;
}

/**
 * Function that creates a Prisma field decorator.
 * @param {IPrismaFieldOptions} options - options for the Prisma field
 */
export function prismaField<T = any>(options: IPrismaFieldOptions<T> = {}): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        if (!Reflect.hasMetadata("prisma:fields", target.constructor)) {
            Reflect.defineMetadata("prisma:fields", [], target.constructor);
        }

        const fields = Reflect.getMetadata(
            "prisma:fields",
            target.constructor,
        ) as IPrismaFieldOptions[];
        const field: IPrismaFieldOptions = {
            name: options.name || propertyKey.toString(),
            type: options.type || type.String || Object || String,
            attr: options.attr || undefined,
            isId: options.isId || false,
            prismaDefault: options.prismaDefault || undefined,
            isOptional: options.isOptional || false,
            isUnique: options.isUnique || false,
            mapField: options.mapField || undefined,
        };

        fields.push(field);
        Reflect.defineMetadata("prisma:fields", fields, target.constructor);
    };
}
