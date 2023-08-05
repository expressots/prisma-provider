import "reflect-metadata";
import { prismaField, prismaModel, prismaRelation } from "../../prisma";
import {
    Action,
    IPrismaRelationOptions,
    Relation,
} from "../../prisma/decorators/prisma-relation.decorator";
import { createRelationships } from "../../prisma/generators/relation-generator";

@prismaModel()
export class TesteClassRel {
    @prismaField({ isId: true })
    id!: string;
}

@prismaModel()
export class TestClass {
    @prismaField({ isId: true })
    id!: string;

    @prismaField()
    name!: string;

    @prismaField({ type: TesteClassRel })
    @prismaRelation({ model: "TesteClassRel", relation: Relation.OneToMany })
    testeClassRel!: TesteClassRel;
}

function removePathDeclaration(objeto) {
    const objetoSemPathDeclaration = { ...objeto };
    delete objetoSemPathDeclaration.classRelation.pathDeclaration;
    return objetoSemPathDeclaration;
}

const filePath = "./src/test/relation-generator/one-to-many.test.ts";

describe("PrismaModel decorator", () => {
    it("should correctly handle all options", async () => {
        const options: IPrismaRelationOptions = {
            model: "TesteClassRel",
            relation: Relation.OneToMany,
            fields: ["testClassId"],
            refs: ["id"],
            name: "testeClassRel",
            onDelete: Action.Cascade,
            onUpdate: Action.Cascade,
        };

        // Passando a própria classe TestClass como o target
        const cls = TestClass;
        let result = await createRelationships(options, cls, filePath);
        result = removePathDeclaration(result);

        const expected = {
            fromEntity: "TestClass",
            toEntity: "TesteClassRel",
            relationStringTo:
                'testClass TestClass? @relation("testeClassRel", fields: [testClassId], references: [id], onDelete: Cascade, onUpdate: Cascade)',
            relationStringFrom: "testeClassRel TesteClassRel[]",
            newRowsTo: ["testClassId String? @unique"],
            newRowsFrom: [],
            relationType: "OneToMany",
            classRelation: { name: "testeClassRel", type: "TesteClassRel" },
        };

        expect(result).toEqual(expected);
    });

    it("should correctly handle all options and relation required false", async () => {
        const options: IPrismaRelationOptions = {
            model: "TesteClassRel",
            relation: Relation.OneToMany,
            fields: ["testClassId"],
            refs: ["id"],
            name: "testeClassRel",
            onDelete: Action.Cascade,
            onUpdate: Action.Cascade,
            isRequired: false,
        };

        // Passando a própria classe TestClass como o target
        const cls = TestClass;
        let result = await createRelationships(options, cls, filePath);
        result = removePathDeclaration(result);

        const expected = {
            fromEntity: "TestClass",
            toEntity: "TesteClassRel",
            relationStringTo:
                'testClass TestClass? @relation("testeClassRel", fields: [testClassId], references: [id], onDelete: Cascade, onUpdate: Cascade)',
            relationStringFrom: "testeClassRel TesteClassRel[]",
            newRowsTo: ["testClassId String? @unique"],
            newRowsFrom: [],
            relationType: "OneToMany",
            classRelation: { name: "testeClassRel", type: "TesteClassRel" },
        };

        expect(result).toEqual(expected);
    });

    it("should correctly handle all options with two refs, without selected fields", async () => {
        const options: IPrismaRelationOptions = {
            model: "TesteClassRel",
            relation: Relation.OneToMany,
            refs: ["id", "name"],
            name: "testeClassRel",
            onDelete: Action.Cascade,
            onUpdate: Action.Cascade,
            isRequired: true,
        };

        // Passando a própria classe TestClass como o target
        const cls = TestClass;
        let result = await createRelationships(options, cls, filePath);
        result = removePathDeclaration(result);

        const expected = {
            fromEntity: "TestClass",
            toEntity: "TesteClassRel",
            relationStringTo:
                'testClass TestClass @relation("testeClassRel", fields: [testClassId, nameId], references: [id, name], onDelete: Cascade, onUpdate: Cascade)',
            relationStringFrom: "testeClassRel TesteClassRel[]",
            newRowsTo: ["testClassId String", "nameId String", "@@unique([testClassId, nameId])"],
            newRowsFrom: ["@@unique([id, name])"],
            relationType: "OneToMany",
            classRelation: { name: "testeClassRel", type: "TesteClassRel" },
        };

        expect(result).toEqual(expected);
    });
});
