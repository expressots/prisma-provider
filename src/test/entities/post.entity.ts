import { prismaField, prismaModel, prismaRelation } from "../../prisma";
import { Relation } from "../../prisma/decorators/prisma-relation.decorator";
import { CategoriesOnPosts } from "./categories-on-post.entity";
import { Category } from "./category.entity";

@prismaModel()
class Post {
    @prismaField({ isId: true })
    id!: number;

    @prismaField()
    title!: string;

    @prismaField()
    content!: string;

    @prismaField({ type: Category })
    @prismaRelation({ relation: Relation.ManyToMany, model: "Category", refs: ["id"] })
    categories!: Category[];

    @prismaField({ type: CategoriesOnPosts })
    @prismaRelation({
        relation: Relation.ManyToManyExplicit,
        model: "CategoriesOnPosts",
        refs: ["id"],
    })
    categories2!: CategoriesOnPosts[];
}

export { Post };
