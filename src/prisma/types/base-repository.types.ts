import { PrismaClient } from "@prisma/client";

export type CreateInput<Model extends ModelsOf<PrismaClient>> = Parameters<
    PrismaClient[Model]["create"]
>[0]["data"];

export type DeleteWhere<Model extends ModelsOf<PrismaClient>> = Parameters<
    PrismaClient[Model]["delete"]
>[0]["where"];

export type Select<
    Model extends ModelsOf<PrismaClient>,
    Method extends "create" | "delete",
> = Parameters<PrismaClient[Model][Method]>[0]["select"];

type PrismaClientMethod =
    | "aggregate"
    | "count"
    | "deleteMany"
    | "findFirst"
    | "findFirstOrThrow"
    | "findMany"
    | "findUnique"
    | "findUniqueOrThrow"
    | "groupBy"
    | "update"
    | "updateMany"
    | "upsert";

export type PrismaAction<
    Model extends ModelsOf<PrismaClient>,
    Method extends PrismaClientMethod,
> = Parameters<PrismaClient[Model][Method]>[0];

export type ModelsOf<Type> = keyof {
    [Property in keyof Type as Type[Property] extends (...args: any) => any
        ? never
        : Property extends symbol
        ? never
        : Property]: Type[Property];
};
