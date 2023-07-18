import { prismaField, prismaModel } from "../../prisma";

@prismaModel()
class Post {
    @prismaField({ isId: true })
    id!: string;
    @prismaField()
    title!: string;
    @prismaField()
    content!: string;
}

export { Post };
