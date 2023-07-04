import { prismaField, prismaModel } from "../../prisma/decorators";
import { db, type } from "../../prisma/types";

@prismaModel()
class User {
    @prismaField({ type: type.Int, isId: true })
    id!: number;

    @prismaField({ type: type.String })
    name!: string;
}

export { User };
