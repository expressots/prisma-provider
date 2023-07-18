/**
 * Interface for defining options for Prisma model.
 * @template T - The data type for the model fields.
 */
export interface IPrismaModelOptions<T = any> {
    map?: string;
}

/**
 * Function to define a Prisma model decorator.
 * @template T - The data type for the model fields.
 * @param { IPrismaModelOptions } options - Options for the Prisma model.
 */
export function prismaModel<T = any>(options: IPrismaModelOptions<T> = {}): ClassDecorator {
    return function (target: any) {
        if (!Reflect.hasMetadata("prisma:model", target)) {
            Reflect.defineMetadata("prisma:model", [], target);
        }

        const model: IPrismaModelOptions = {
            map: options.map,
        };

        Reflect.defineMetadata("prisma:model", model, target);
    };
}
