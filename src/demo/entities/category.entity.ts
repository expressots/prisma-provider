import { Default, prismaField, prismaModel } from "../../prisma/decorators";

@prismaModel()
class Category {
    @prismaField({ isId: true, prismaDefault: Default.Uuid })
    id!: string;

    @prismaField({ prismaDefault: Default.Uuid })
    name!: string;

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    constructor(name: string, age: number) {}
}

export { Category };
