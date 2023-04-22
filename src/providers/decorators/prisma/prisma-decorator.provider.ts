import "reflect-metadata";
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

export interface PrismaFieldOptions {
  name?: string;
  type: PrismaFieldType;
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
}

export function PrismaField(options: PrismaFieldOptions): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    if (!Reflect.hasMetadata("prisma:fields", target.constructor)) {
      Reflect.defineMetadata("prisma:fields", [], target.constructor);
    }

    const fields = Reflect.getMetadata("prisma:fields", target.constructor) as PrismaFieldOptions[];
    fields.push({ ...options, name: propertyKey.toString() });
    Reflect.defineMetadata("prisma:fields", fields, target.constructor);
  };
}
