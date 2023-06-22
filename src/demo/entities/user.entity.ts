import { PrismaDefault, PrismaField } from "../../prisma/decorators";
import { ScalarType } from "../../prisma/types/scalar-types";

class User {
  @PrismaField({ isId: true, isUnique: true, type: ScalarType.DateTime, prismaDefault: PrismaDefault.Now })
  id!: number;

  constructor(name: string, age: number) {
  }
}

export default User;