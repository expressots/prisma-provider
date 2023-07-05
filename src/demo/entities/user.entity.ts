import {
    Default,
    prismaField,
    prismaIndex,
    prismaModel,
    prismaRelation,
} from "../../prisma/decorators";
import { Relation } from "../../prisma/decorators/prisma-relation.decorator";
import { db, type } from "../../prisma/types";

enum Color {
    RED = "RED",
    GREEN = "GREEN",
    BLUE = "BLUE",
}

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
    id!: number;

    @prismaField({ type: type.String, isUnique: true })
    @prismaIndex({ fields: ["email"] })
    email!: string;

    @prismaField({ type: type.DateTime, prismaDefault: Default.UpdateAt })
    updatedAt!: Date;

    @prismaField({ type: Profile, isOptional: true })
    @prismaRelation({ relation: Relation.OneToOne, model: Profile, PK: ["id"] })
    profile!: Profile;
}

export { User, Profile };
