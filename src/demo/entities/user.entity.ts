import { PrismaDefault, PrismaField, PrismaInput, PrismaRelation, PrismaType } from "../../prisma/decorators";
import Post from "./post.entity";

@PrismaInput
class User {
  @PrismaField({ isId: true, isUnique: true, prismaDefault: PrismaDefault.Autoincrement })
  id!: number;

  @PrismaField()
  name?: string | null;

  @PrismaField()
  age!: number;

  // @PrismaField({ type: "Post[]" })
  // posts?: Post[];

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

export default User;