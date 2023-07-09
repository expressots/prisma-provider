import { Default, prismaField, prismaModel, prismaRelation } from "../../prisma/decorators";
import { Relation } from "../../prisma/decorators/prisma-relation.decorator";
import { Category } from "./category.entity";
@prismaModel()
class Post {
    @prismaField({ isId: true, prismaDefault: Default.Uuid })
    id!: string;

    @prismaField({ prismaDefault: Default.Uuid })
    name!: string;

    @prismaField({ type: Category, isOptional: true })
    @prismaRelation({ relation: Relation.ManyToMany, model: "Category" })
    category!: Category[];
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    constructor(name: string, age: number) {}
}

export { Post };
