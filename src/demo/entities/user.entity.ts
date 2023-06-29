import { PrismaDefault, prismaField } from "../../prisma/decorators";
import { prismaModel } from "../../prisma/decorators/prismaModel.decorator";
import { ScalarType } from "../../prisma/types/scalar.types";
import { PostgresAttr } from '../../prisma/types/typeAttributes/postgres-attr';
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
  @prismaField({ isId: true, prismaDefault: PrismaDefault.Uuid, mapField: "_id"})  
  id!: string;

  @prismaField()
  name!: string;

  @prismaField({ type: Color, isOptional: false })
  color!: Color[];

  @prismaField({ type: Role, isOptional: false })
  role!: Role;

  @prismaField({ type: "Photo[]", isOptional: false })
  photos!: Photo[];
  
  constructor(name: string, age: number) {
  }
}

export { User };