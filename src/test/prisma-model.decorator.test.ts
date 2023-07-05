import "reflect-metadata";
import { IPrismaModelOptions, prismaModel } from "../prisma/decorators/prisma-model.decorator";

describe("PrismaModel decorator", () => {
    it("should correctly handle all options", () => {
        const options: IPrismaModelOptions = {
            map: "test_map",
        };

        @prismaModel(options)
        class TestClass {}

        const model = Reflect.getMetadata("prisma:model", TestClass) as IPrismaModelOptions;

        expect(model.map).toEqual(options.map);
    });

    it("should handle no options correctly", () => {
        @prismaModel()
        class TestClass {}

        const model = Reflect.getMetadata("prisma:model", TestClass) as IPrismaModelOptions;

        expect(model).toEqual({});
    });
});
