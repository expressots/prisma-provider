import { PrismaField, PrismaInput } from "../../prisma/decorators";

class Address {

    @PrismaField({ type: "String", isId: true })
    id!: string;
}

export { Address };