import { PrismaDefault, PrismaField } from "../../prisma/decorators";
import Post from "./post.entity";

class User {
    @PrismaField({ type: "Int", isId: true, isOptional: false, isUnique: true, prismaDefault: PrismaDefault.Autoincrement })
    id: number;
  
    @PrismaField({ type: "String", isOptional: true })
    name?: string;
  
    @PrismaField({ type: "Int", isOptional: false })
    age: number;

    // Use the decorator for the relation field as well
    @PrismaField({ type: "Post[]" })
    posts?: Post[];
  
    constructor(id: number, name: string, age: number) {
      this.id = id;
      this.name = name;
      this.age = age;
    }
}
  
  export default User;