import { PrismaDefault, PrismaField, PrismaInput, PrismaRelation, PrismaType } from "../../prisma/decorators";
import Post from "./post.entity";

class User {
  @PrismaField({ isId: true, isUnique: true, type: "Int", prismaDefault: PrismaDefault.Autoincrement })
  id!: number;

  @PrismaField({ type: "String" })
  name?: string;

  @PrismaField({ type: "String"})
  age!: number;

  @PrismaField({ type: "Post[]" })
  posts?: Post[];

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

export default User;