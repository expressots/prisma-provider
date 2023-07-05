import { prismaField, prismaModel } from "../../prisma/decorators";
import { db, type } from "../../prisma/types";

@prismaModel()
class User {
    @prismaField({ type: type.String, isId: true })
    id!: number;

    @prismaField({ type: type.String, isUnique: true })
    email!: string;
}

export { User };
