import { prismaField, prismaModel } from "../../prisma";

@prismaModel()
class Profile {
    @prismaField({ isId: true })
    id!: string;

    @prismaField()
    content!: string;
}

export { Profile };
