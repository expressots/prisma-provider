export const enum Pattern {
    LOWER_CASE = "lowercase",
    KEBAB_CASE = "kebab-case",
    PASCAL_CASE = "PascalCase",
    CAMEL_CASE = "camelCase",
}

export type Provider = {
    prisma: {
        schemaName: string;
        schemaPath: string;
        entitiesPath: string;
        entityNamePattern: string;
    };
};

export interface ExpressoConfig {
    scaffoldPattern: Pattern;
    sourceRoot: string;
    opinionated: boolean;
    providers?: Provider;
}
