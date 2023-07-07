import { Default, prismaField, prismaModel } from "../../prisma/decorators";
@prismaModel()
class Post {
    @prismaField({ isId: true, prismaDefault: Default.Uuid, mapField: "_id" })
    id!: string;

    @prismaField({ isId: true, prismaDefault: Default.Uuid })
    name!: string;

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    constructor(name: string, age: number) {}
}

export { Post };
