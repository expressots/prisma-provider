import fs from "fs";
import { codeFirstGen } from "../prisma";

describe("Create expressots.config.ts", () => {
    const configFileContent = `import { ExpressoConfig, Pattern } from "./src/@types/config";
const config: ExpressoConfig = {
    sourceRoot: "src",
    scaffoldPattern: Pattern.KEBAB_CASE,
    opinionated: true,
    providers: {
        prisma: {
            schemaName: "schema",
            schemaPath: "src/test",
            entitiesPath: "test/entities-postgres",
            entityNamePattern: "entity",
        },
    },
};

export default config;
`;

    const schemaFileContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgres"
  url      = "test"
}

enum UnusedEnum {
  TEST1
}
`;

    beforeAll(() => {
        const filePath = "expressots.config.ts";
        fs.writeFileSync(filePath, configFileContent, { encoding: "utf8" });

        const filePathSchemaPrisma = "./src/test/schema.prisma";
        fs.writeFileSync(filePathSchemaPrisma, schemaFileContent, { encoding: "utf8" });
    });

    afterAll(() => {
        const filePath = "expressots.config.ts";
        fs.unlinkSync(filePath);

        const filePathSchemaPrisma = "./src/test/schema.prisma";
        fs.unlinkSync(filePathSchemaPrisma);
    });

    it("should create expressots.config.ts file with the correct content", () => {
        const filePath = "expressots.config.ts";
        expect(fs.existsSync(filePath)).toBe(true);

        const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
        expect(fileContent).toMatchSnapshot();
    });

    it("Check schema.prisma", async () => {
        const filePathSchemaPrisma = "./src/test/schema.prisma";
        expect(fs.existsSync(filePathSchemaPrisma)).toBe(true);

        await codeFirstGen();

        const fileContent = fs.readFileSync(filePathSchemaPrisma, { encoding: "utf8" });
        expect(fileContent).toMatchSnapshot();
    }, 120000);
});
