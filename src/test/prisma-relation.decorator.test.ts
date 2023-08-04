import "reflect-metadata";
import {
    Action,
    IPrismaRelationOptions,
    Relation,
    prismaRelation,
} from "../prisma/decorators/prisma-relation.decorator";

describe("PrismaRelation decorator", () => {
    it("should handle all options correctly", () => {
        const options: IPrismaRelationOptions = {
            name: "test_name",
            relation: Relation.OneToOne,
            model: "",
            refs: ["test_pk"],
            fields: ["test_fk"],
            onDelete: Action.Cascade,
            onUpdate: Action.SetDefault,
            isRequired: true,
        };

        class TestClass {
            @prismaRelation(options)
            testRelation!: string;
        }

        const relations = Reflect.getMetadata(
            "prisma:relations",
            TestClass,
        ) as IPrismaRelationOptions[];
        const relation = relations.find((r) => r.name === "test_name");

        expect(relation).toBeDefined();
        expect(relation).toEqual(options);
    });

    it("should handle missing options correctly", () => {
        const options: IPrismaRelationOptions = {
            relation: Relation.ManyToMany,
            model: "",
            refs: ["test_pk"],
        };

        class TestClass {
            @prismaRelation(options)
            testRelation!: string;
        }

        const relations = Reflect.getMetadata(
            "prisma:relations",
            TestClass,
        ) as IPrismaRelationOptions[];
        const relation = relations.find((r) => r.relation === Relation.ManyToMany);

        expect(relation).toBeDefined();
        expect(relation).toEqual({
            ...options,
            name: undefined,
            FK: undefined,
            onDelete: undefined,
            onUpdate: undefined,
            map: undefined,
            isRequired: false,
        });
    });
});
