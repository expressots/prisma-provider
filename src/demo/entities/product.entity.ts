import { PrismaField } from "../../prisma/decorators";

export class Product {

    @PrismaField({ isId: true, isUnique: true, type: "Int" })
    id!: number;

    @PrismaField({ type: "String" })
    name!: string;
}