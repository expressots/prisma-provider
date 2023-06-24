import { PrismaDefault, prismaField } from "../../prisma/decorators";
import { IndexType, prismaIndex } from "../../prisma/decorators/index.decorator";
import { prismaModel } from "../../prisma/decorators/prismaModel.decorator";
import { ScalarType } from "../../prisma/types/scalar.types";

@prismaModel({ map: "users"})
class User {
  @prismaField({isId: true, type: ScalarType.Int, prismaDefault: PrismaDefault.AutoIncrement })
  id!: number;

  @prismaField({type: ScalarType.String, isUnique: true})
  name!: string;

  constructor(name: string, age: number) {
  }
}

export default User;