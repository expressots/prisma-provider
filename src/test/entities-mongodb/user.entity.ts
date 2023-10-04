import { Default, prismaField, prismaIndex, prismaModel } from "../../prisma";
import { db, type } from "../../prisma/types";

type Photo = {
    height: number;
    width: number;
    url: string;
};

@prismaModel({ map: "user" })
class User {
    @prismaField({ isId: true, mapField: "_id" })
    id!: string;

    @prismaField({ isUnique: true })
    email!: number;

    @prismaField({ isUnique: true, isOptional: true })
    phone?: number;

    @prismaField({ type: type.String, attr: db.Mongo.String })
    description!: string;

    @prismaField({ type: type.DateTime, prismaDefault: Default.Now })
    createdAt!: Date;

    @prismaField({ type: type.DateTime, prismaDefault: "@updatedAt" })
    updatedAt!: Date;

    @prismaField({ type: "Photo" })
    photo!: Photo;
}

export { User };
