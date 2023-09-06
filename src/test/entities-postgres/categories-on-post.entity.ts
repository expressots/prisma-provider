import { Default, prismaField, prismaModel } from "../../prisma/decorators";
import { type } from "../../prisma/types";

@prismaModel()
class CategoriesOnPosts {
    @prismaField({ type: type.Int, isId: true, prismaDefault: Default.AutoIncrement })
    id!: number;

    @prismaField({ type: type.DateTime, prismaDefault: Default.Now })
    asignedAt!: Date;

    @prismaField({ type: type.String })
    assignedBy!: string;
}

export { CategoriesOnPosts };
