import { PrismaDefault, prismaField, prismaModel } from "../../prisma/decorators";
import { ScalarType } from "../../prisma/types";
import { Role } from "./role";

@prismaModel()
class Post {
  @prismaField({ isId: true, prismaDefault: PrismaDefault.Uuid, mapField: "_id"})  
  id!: string;

  @prismaField({ type: ScalarType.String, isOptional: false })
  name!: String;
  
  @prismaField({ type: Role, isOptional: false })
  role!: Role;

  constructor(name: string, age: number) {
  }
}

export { Post };