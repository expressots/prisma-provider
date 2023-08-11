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
            entitiesPath: "test/entities",
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
`;

    const schemaResultFileContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgres"
  url      = "test"
}

model CategoriesOnPosts {
  id         Int       @id @default(autoincrement())
  asignedAt  DateTime  @default(now())
  assignedBy String
  category   Category? @relation(fields: [categoryId], references: [id])
  categoryId String?   @unique
  post       Post?     @relation(fields: [postId], references: [id])
  postId     String?   @unique
}

model Category {
  id    String              @id @default(uuid())
  name  String              @default(uuid())
  posts CategoriesOnPosts[]
  post  Post[]
}

model Post {
  id          String              @id
  title       String
  content     String
  categories  Category[]
  categories2 CategoriesOnPosts[]
  user        User?               @relation(fields: [userId], references: [id])
  userId      String?             @unique
}

model Profile {
  id      String  @id
  content String
  user    User?   @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  userId  String? @unique
}

model User {
  id      String   @id
  email   String   @unique
  role    Role
  profile Profile?
  posts   Post[]
}

enum Role {
  ADMIN
  REGULAR
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
        expect(fileContent).toEqual(configFileContent);
    });

    it("Check schema.prisma", async () => {
        const filePathSchemaPrisma = "./src/test/schema.prisma";
        expect(fs.existsSync(filePathSchemaPrisma)).toBe(true);

        await codeFirstGen();

        const fileContent = fs.readFileSync(filePathSchemaPrisma, { encoding: "utf8" });
        expect(fileContent).toEqual(schemaResultFileContent);
    }, 60000);
});
