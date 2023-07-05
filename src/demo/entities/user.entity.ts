import { prismaField, prismaIndex, prismaModel } from "../../prisma/decorators";
import { db, type } from "../../prisma/types";

enum Color {
    RED = "RED",
    GREEN = "GREEN",
    BLUE = "BLUE",
}

@prismaModel()
class User {
    @prismaField({ type: type.String, isId: true })
    id!: number;

    @prismaField({ type: type.String, isUnique: true })
    @prismaIndex({ fields: ["email"] })
    email!: string;

    cpf!: string;
}

export { User };
