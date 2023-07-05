import "reflect-metadata";
import { prismaField } from "../prisma";
import { Default, IPrismaFieldOptions } from "../prisma/decorators/prisma-field.decorator";
import { db, type } from "../prisma/types";

describe("PrismaField decorator", () => {
    it("should handle no options correctly", () => {
        // Create a test class with the decorator and no options.
        class TestClass {
            @prismaField()
            testField!: string;
        }

        // Get the stored metadata.
        const fields = Reflect.getMetadata("prisma:fields", TestClass) as IPrismaFieldOptions[];

        // Expect the field metadata to be filled with default values.
        expect(fields).toHaveLength(1);
        expect(fields[0]).toEqual({
            name: "testField",
            type: expect.any(String),
            attr: undefined,
            isId: false,
            prismaDefault: undefined,
            isOptional: false,
            isUnique: false,
            mapField: undefined,
        });
    });

    it("should handle all options correctly", () => {
        const options: IPrismaFieldOptions = {
            name: "id",
            type: type.String,
            attr: db.Postgres.Text,
            isId: true,
            prismaDefault: Default.AutoIncrement,
            isOptional: true,
            isUnique: true,
            mapField: "mappedField",
        };

        class TestClass {
            @prismaField(options)
            testField!: string;
        }

        const fields = Reflect.getMetadata("prisma:fields", TestClass) as IPrismaFieldOptions[];
        const field = fields[0];

        expect(field.name).toBe(options.name);
        expect(field.type).toBe(options.type);
        expect(field.attr).toBe(options.attr);
        expect(field.isId).toBe(options.isId);
        expect(field.prismaDefault).toBe(options.prismaDefault);
        expect(field.isOptional).toBe(options.isOptional);
        expect(field.isUnique).toBe(options.isUnique);
        expect(field.mapField).toBe(options.mapField);
    });
});
