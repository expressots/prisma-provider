import "reflect-metadata";
import {
    IPrismaIndexOptions,
    IndexType,
    prismaIndex,
} from "../prisma/decorators/prisma-index.decorator";

describe("PrismaIndex decorator", () => {
    it("should correctly handle all options", () => {
        const options: IPrismaIndexOptions = {
            fields: ["field1", "field2"],
            map: "map",
            name: "index_name",
            type: IndexType.Btree,
        };

        class TestClass {
            @prismaIndex(options)
            testField!: string;
        }

        const indices = Reflect.getMetadata("prisma:index", TestClass) as IPrismaIndexOptions[];
        const index = indices[0];

        expect(index.fields).toEqual(options.fields);
        expect(index.map).toBe(options.map);
        expect(index.name).toBe(options.name);
        expect(index.type).toBe(options.type);
    });

    it("should correctly handle options when used as a class decorator", () => {
        const options: IPrismaIndexOptions = {
            fields: ["field1", "field2"],
            map: "map",
            name: "index_name",
            type: IndexType.Btree,
        };

        @prismaIndex(options)
        class TestClass {}

        const indices = Reflect.getMetadata("prisma:index", TestClass) as IPrismaIndexOptions[];
        const index = indices[0];

        expect(index.fields).toEqual(options.fields);
        expect(index.map).toBe(options.map);
        expect(index.name).toBe(options.name);
        expect(index.type).toBe(options.type);
    });
});
