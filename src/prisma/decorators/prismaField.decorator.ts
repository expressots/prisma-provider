import { MongoAttrType } from './../types/typeAttributes/mongo-attr';
import "reflect-metadata";
import { ScalarType } from "../types/scalar.types";
import { PostgresAttrType } from "../types/typeAttributes/postgres-attr";
import { MySQLAttrType } from "../types/typeAttributes/mysql-attr";
import { CockroachDBAttrType, MssqlAttrType } from '../types';

export enum PrismaDefault {
  Auto = "auto",
  AutoIncrement = "autoincrement",
  Sequence = "sequence",
  Cuid = "cuid",
  Uuid = "uuid",
  Now = "now",
  DBgenerated = "dbgenerated"
}

type PrismaFieldTypeMap = {
  [key in ScalarType]: string;
};

const PrismaFieldMapping: PrismaFieldTypeMap = {
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

export interface IPrismaFieldOptions<T = any> {
  type?: ScalarType | string; // TODO: type needs to accept user created types
  attr?: PostgresAttrType | MySQLAttrType | MongoAttrType | MssqlAttrType | CockroachDBAttrType;
  isId?: boolean; // 100%
  isOptional?: boolean; // 100%
  isUnique?: boolean; // 100%
  prismaDefault?: PrismaDefault; // 50% function - pending 50%: static value based on type
  mapField?: string; // 100%
  name?: string;
}

export function prismaField<T = any>(options: IPrismaFieldOptions<T> = {}): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    if (!Reflect.hasMetadata("prisma:fields", target.constructor)) {
      Reflect.defineMetadata("prisma:fields", [], target.constructor);
    }
    
    const fields = Reflect.getMetadata("prisma:fields", target.constructor) as IPrismaFieldOptions[];
    const field: IPrismaFieldOptions = { 
      name : options.name || propertyKey.toString(),
      type: options.type || ScalarType.String,
      attr: options.attr || undefined,
      isId: options.isId || false,
      prismaDefault: options.prismaDefault || undefined,
      isOptional: options.isOptional || false,
      isUnique: options.isUnique || false,
      mapField: options.mapField || undefined,
      db: options.db || undefined,
      transform: options.transform || undefined,
    }
    console.log(field);
    fields.push(field);
    Reflect.defineMetadata("prisma:fields", fields, target.constructor);
  };
}

