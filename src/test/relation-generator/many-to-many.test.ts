import "reflect-metadata";
import { prismaField, prismaModel, prismaRelation } from "../../prisma";
import {
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
    @prismaRelation({ model: "TesteClassRel", relation: Relation.ManyToMany })
    testeClassRel!: TesteClassRel;
}

function removePathDeclaration(objeto) {
    const objetoSemPathDeclaration = { ...objeto };
    delete objetoSemPathDeclaration.classRelation.pathDeclaration;
    return objetoSemPathDeclaration;
}

const filePath = "./src/test/relation-generator/many-to-many.test.ts";

describe("PrismaModel decorator", () => {
    it("should correctly handle all options", async () => {
        const options: IPrismaRelationOptions = {
            model: "TesteClassRel",
            relation: Relation.ManyToMany,
            name: "testeClassRel",
        };

        // Passando a própria classe TestClass como o target
        const cls = TestClass;
        let result = await createRelationships(options, cls, filePath);
        result = removePathDeclaration(result);

        const expected = {
            fromEntity: "TestClass",
            toEntity: "TesteClassRel",
            relationStringTo: 'testClass TestClass[] @relation("testeClassRel")',
            relationStringFrom: 'testeClassRel TesteClassRel[] @relation("testeClassRel")',
            newRowsTo: [],
            newRowsFrom: [],
            relationType: "ManyToMany",
            classRelation: { name: "testeClassRel", type: "TesteClassRel" },
        };

        expect(result).toEqual(expected);
    });
});
