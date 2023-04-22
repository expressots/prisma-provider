import { PrismaField, PrismaFieldMapping, PrismaType } from "../providers/decorators/prisma/prisma-decorator.provider";
import User from "./user.entity";

class Post {
    @PrismaField({ type: "Int", isId: true })
    id: number;

    @PrismaField({ type: "String" })
    title: string;

    @PrismaField({ type: "String" })
    content: string;

    @PrismaField({
        type: "User",
        relation: {
          fields: ["authorId"],
          references: ["id"],
          referenceType: PrismaType.Int,
        },
    })
    author?: User;

    constructor(id: number, title: string, content: string) {
        this.id = id;
        this.title = title;
        this.content = content;
    }
}

export default Post;