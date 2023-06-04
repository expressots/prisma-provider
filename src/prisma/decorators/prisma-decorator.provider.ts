import "reflect-metadata";
import { plainToClass } from 'class-transformer';

export type PrismaFieldType = "String" | "Int" | "Boolean" | "DateTime" | "Json" | string;
export enum PrismaDefault {
  Autoincrement = "autoincrement",
  Now = "now",
  Cuid = "cuid",
  Uuid = "uuid",
}

export type PrismaFieldTypeMap = {
  [key in PrismaFieldType]: string;
};

export const PrismaFieldMapping: PrismaFieldTypeMap = {
  String: "String",
  Int: "Int",
  Boolean: "Boolean",
  DateTime: "DateTime",
  Json: "Json",
  UUID: "String",
  Bytes: "Bytes",
  Decimal: "Decimal",
};

export enum PrismaType {
  String = "String",
  Int = "Int",
  Boolean = "Boolean",
  DateTime = "DateTime",
  Json = "Json",
  UUID = "String",
  Bytes = "Bytes",
  Decimal = "Decimal",
}

export interface PrismaFieldOptions<T = any> {
  name?: string;
  type?: PrismaFieldType;
  isId?: boolean;
  isOptional?: boolean;
  isUnique?: boolean;
  default?: any;
  prismaDefault?: PrismaDefault;
  relation?: {
    fields: string[];
    references: Array<string>;
    referenceType: PrismaType;
  };
  map?: string;
  db?: string;
  transform?: (value: T) => any;
}

export function PrismaField<T = any>(options: PrismaFieldOptions<T> = {}): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    if (!Reflect.hasMetadata("prisma:fields", target.constructor)) {
      Reflect.defineMetadata("prisma:fields", [], target.constructor);
    }

    const fields = Reflect.getMetadata("prisma:fields", target.constructor) as PrismaFieldOptions[];
    fields.push({ ...options, name: propertyKey.toString(), isOptional: options.type ? options.type.endsWith(' | null') : true });
    Reflect.defineMetadata("prisma:fields", fields, target.constructor);
  };
}

export function PrismaInput<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      return plainToClass(constructor, this);
    }
  };
}

export interface PrismaRelationOptions {
  relation?: {
    fields: string[];
    references: string[];
    referenceType: PrismaType;
  };
}

export function PrismaRelation(options: PrismaRelationOptions): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    if (!Reflect.hasMetadata("prisma:relations", target.constructor)) {
      Reflect.defineMetadata("prisma:relations", [], target.constructor);
    }

    const relations = Reflect.getMetadata("prisma:relations", target.constructor) as PrismaRelationOptions[];
    relations.push({ ...options });
    Reflect.defineMetadata("prisma:relations", relations, target.constructor);
  };
}
