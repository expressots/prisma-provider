import { PrismaDefault, PrismaField } from "../../prisma/decorators";
import { PrismaModel } from "../../prisma/decorators/prismaModel.decorator";
import { ScalarType } from "../../prisma/types/scalar.types";

@PrismaModel({map: "users"})
class User {
  @PrismaField({isId: true, type: ScalarType.Int})
  id!: number;

  name!: string;

  constructor(name: string, age: number) {
  }
}

export default User;