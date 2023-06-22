import "reflect-metadata";
import { plainToClass } from 'class-transformer';
import { ScalarType } from "../types/scalar-types";

export enum PrismaDefault {
  AutoIncrement = "autoincrement",
  Now = "now",
  Cuid = "cuid",
  Uuid = "uuid",
}

export type PrismaFieldTypeMap = {
  [key in ScalarType]: string;
};

export const PrismaFieldMapping: PrismaFieldTypeMap = {
  String: "String",
  Int: "Int",
  BigInt: "BigInt",
  Float: "Float",
  Boolean: "Boolean",
  DateTime: "DateTime",
  Json: "Json",
  Bytes: "Bytes",
  Decimal: "Decimal",
};

export interface PrismaFieldOptions<T = any> {
  type?: ScalarType;
  attr?: string;
  isId?: boolean; // @id if there is more than one isId, @@id([id1, id2])
  isOptional?: boolean;
  isUnique?: boolean;
  prismaDefault?: PrismaDefault;
  map?: string;
  db?: string;
  transform?: (value: T) => any;
  name?: string;
}

export function PrismaField<T = any>(options: PrismaFieldOptions<T> = {}): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    if (!Reflect.hasMetadata("prisma:fields", target.constructor)) {
      Reflect.defineMetadata("prisma:fields", [], target.constructor);
    }

    const fields = Reflect.getMetadata("prisma:fields", target.constructor) as PrismaFieldOptions[];
    const field: PrismaFieldOptions = { 
      name : options.name || propertyKey.toString(),
      type: options.type || ScalarType.String,
      attr: options.attr || PrismaFieldMapping[options.type || ScalarType.String],
      isId: options.isId || false,
      prismaDefault: options.prismaDefault || undefined,
      isOptional: options.isOptional || false,
      isUnique: options.isUnique || false,
      map: options.map || undefined,
      db: options.db || undefined,
      transform: options.transform || undefined,
    }


    fields.push(field);
    Reflect.defineMetadata("prisma:fields", fields, target.constructor);
  };
}

//, isOptional: options.type ? options.type.endsWith(' | null') : true 

