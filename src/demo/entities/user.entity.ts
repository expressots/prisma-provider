import {
    Default,
    prismaField,
    prismaIndex,
    prismaModel,
    prismaRelation,
} from "../../prisma/decorators";
import { Action, Relation } from "../../prisma/decorators/prisma-relation.decorator";
import { type } from "../../prisma/types";
import { Post } from "./post.entity";

@prismaModel()
class Profile {
    @prismaField({ type: type.Int, isId: true })
    id!: number;
    @prismaField({ type: type.String, isUnique: true })
    bio!: string;
}

@prismaModel()
class User {
    @prismaField({ type: type.String, isId: true })
    id!: string;

    @prismaField({ type: type.String, isUnique: true })
    @prismaIndex({ fields: ["email"] })
    email!: string;

    @prismaField({ type: type.DateTime, prismaDefault: Default.UpdateAt })
    updatedAt!: Date;

    @prismaField({ type: Profile, isOptional: true })
    @prismaRelation({
        relation: Relation.OneToOne,
        model: "Profile",
        PK: ["id", "email"],
        onDelete: Action.Cascade,
    })
    profile!: Profile;

    @prismaField({ type: Post, isOptional: true })
    @prismaRelation({
        name: "post_FK",
        relation: Relation.OneToOne,
        model: "Post",
        PK: ["id"],
        onDelete: Action.Restrict,
        onUpdate: Action.Cascade,
    })
    post!: Post;
}

export { User, Profile };
