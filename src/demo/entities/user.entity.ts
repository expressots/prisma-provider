import { PrismaDefault, prismaField } from "../../prisma/decorators";
import { prismaModel } from "../../prisma/decorators/prismaModel.decorator";
import { ScalarType } from "../../prisma/types/scalar.types";
import { PostgresAttr } from "../../prisma/types/typeAttributes/postgres-attr";

@prismaModel()
class User {
  @prismaField({ type: ScalarType.String, attr: PostgresAttr.Text, isId: true, prismaDefault: PrismaDefault.Uuid})  
  id!: number;

  @prismaField({ attr: PostgresAttr.Text})
  name!: string;

  constructor(name: string, age: number) {
  }
}

export default User;