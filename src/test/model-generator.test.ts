import "reflect-metadata";
import { getDecorators } from "../prisma/generators/model-generator";

jest.mock("reflect-metadata");

describe("getDecorators", () => {
    it("should correctly retrieve the decorators of a class", () => {
        // Arrange
        class TestClass {}
        const mockModelDecorator = { name: "TestClass" };
        const mockFieldsDecorator = [
            { name: "id", type: "Int", isId: true },
            { name: "name", type: "String" },
        ];
        const mockIndexOptions = [{ name: "index", fields: ["name"] }];
        const mockRelationOptions = [{ name: "relation", fields: ["otherClass"] }];
        Reflect.getMetadata = jest.fn().mockImplementation((key) => {
            if (key === "prisma:model") {
                return mockModelDecorator;
            } else if (key === "prisma:fields") {
                return mockFieldsDecorator;
            } else if (key === "prisma:index") {
                return mockIndexOptions;
            } else if (key === "prisma:relations") {
                return mockRelationOptions;
            }
        });

        // Act
        const result = getDecorators(TestClass);

        // Assert
        expect(result).toEqual({
            model: mockModelDecorator,
            fields: mockFieldsDecorator,
            indexes: mockIndexOptions,
            relations: mockRelationOptions,
        });
    });

    it("should correctly handle no decorators", () => {
        // Arrange
        class TestClass {}
        Reflect.getMetadata = jest.fn().mockReturnValue(undefined);

        // Act
        const result = getDecorators(TestClass);

        // Assert
        expect(result).toEqual({
            model: false,
            fields: [],
            indexes: [],
            relations: [],
        });
    });
});
