import { Default, prismaField } from "../../prisma/decorators";
import { prismaModel } from "../../prisma/decorators/prismaModel.decorator";
import { prismaRelation } from "../../prisma/decorators/prismaRelation.decorator";
import { fn } from "../../prisma/types";
import { ScalarType } from "../../prisma/types/scalar.types";
import { Post } from "./post.entity";
import { Role } from "./role";

export enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue",
}

type Photo = {
  height: number;
  width: number;
  url: string;
};

@prismaModel()
class User {
  @prismaField({ type: ScalarType.Int, isId: true, prismaDefault: Default.Value(1), mapField: "_id"})  
  id!: string;

  @prismaField()
  name!: string;

  @prismaField({ isId: true, type: Color, isUnique: true, isOptional: false })
  color!: Color;
  
  @prismaField({ isId: true, type: Role, isUnique: true, isOptional: false })
  role!: Role;
  
  @prismaField({ type: Post, isOptional: false })
  @prismaRelation({ fields: ["authoId"], references: ["id"] })
  post?: Post[];

  @prismaField({ type: ScalarType.DateTime, attr: fn.CockroachDB.Time(1) })
  money!: number;

  constructor(name: string, age: number) {
  }
}

export { User };

