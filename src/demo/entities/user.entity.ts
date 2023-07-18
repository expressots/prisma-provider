import { prismaField, prismaModel, prismaRelation } from "../../prisma";
import { Relation } from "../../prisma/decorators/prisma-relation.decorator";
import { Post } from "./post.entity";

@prismaModel()
class User {
    @prismaField({ isId: true })
    id!: string;
    @prismaField({ isUnique: true })
    name!: string;
    @prismaField({ isUnique: true })
    email!: string;
    @prismaField({ isOptional: true })
    age?: number;

    @prismaField({ type: Post })
    @prismaRelation({ relation: Relation.OneToMany, model: "Post", PK: ["authorId"] })
    posts?: Post[];
}

export { User };
