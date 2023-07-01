import { prismaField, prismaModel } from "../../prisma/decorators";
import { ScalarType } from "../../prisma/types";

@prismaModel()
class User {
    @prismaField({ type: ScalarType.Int, isId: true })
    id!: number;

    @prismaField({ type: ScalarType.String })
    name!: string;
}

export { User };
