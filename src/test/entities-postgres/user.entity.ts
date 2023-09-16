import { prismaField, prismaModel, prismaRelation } from "../../prisma";
import { Action, Relation } from "../../prisma/decorators/prisma-relation.decorator";
import { Post } from "./post.entity";
import { Profile } from "./profile.entity";

enum Role {
    ADMIN = "ADMIN",
    REGULAR = "REGULAR",
}

@prismaModel()
class User {
    @prismaField({ isId: true })
    id!: string;

    @prismaField({ isUnique: true })
    email!: number;

    @prismaField({ type: Role })
    role!: Role;

    @prismaField({ type: Profile })
    @prismaRelation({
        relation: Relation.OneToOne,
        model: "Profile",
        refs: ["id"],
        onDelete: Action.Cascade,
        onUpdate: Action.Cascade,
    })
    profile!: Profile;

    @prismaField({ type: Post })
    @prismaRelation({
        relation: Relation.OneToMany,
        model: "Post",
        refs: ["id"],
    })
    posts!: Post[];
}

export { User };
