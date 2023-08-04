import { Default, prismaField, prismaModel, prismaRelation } from "../../prisma/decorators";
import { Relation } from "../../prisma/decorators/prisma-relation.decorator";
import { CategoriesOnPosts } from "./categories-on-post.entity";

@prismaModel()
class Category {
    @prismaField({ isId: true, prismaDefault: Default.Uuid })
    id!: string;

    @prismaField({ prismaDefault: Default.Uuid })
    name!: string;

    @prismaField({ type: CategoriesOnPosts })
    @prismaRelation({
        relation: Relation.ManyToManyExplicit,
        model: "CategoriesOnPosts",
        refs: ["id"],
    })
    posts!: CategoriesOnPosts;
}

export { Category };
