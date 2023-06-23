import { PrismaDefault, PrismaField } from "../../prisma/decorators";
import { PrismaModel } from "../../prisma/decorators/prismaModel.decorator";
import { ScalarType } from "../../prisma/types/scalar.types";

class User {
  @PrismaField({ mapField: "_id", type: ScalarType.Int, isId: true, prismaDefault: PrismaDefault.AutoIncrement})
  id!: number;

  constructor(name: string, age: number) {
  }
}

export default User;