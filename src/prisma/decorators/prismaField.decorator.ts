import { FunctionAttr } from './../types/typeAttributes/attr-function';
import "reflect-metadata";
import { MongoAttrType } from './../types/typeAttributes/mongo-attr';
import { ScalarType } from "../types/scalar.types";
import { PostgresAttrType } from "../types/typeAttributes/postgres-attr";
import { MySQLAttrType } from "../types/typeAttributes/mysql-attr";
import { MssqlAttrType } from "../types/typeAttributes/msql-attr";
import { CockroachDBAttrType } from "../types/typeAttributes/cockroachDB-attr";

export enum PrismaDefault {
  Auto = "auto",
  AutoIncrement = "autoincrement",
  Sequence = "sequence",
  Cuid = "cuid",
  Uuid = "uuid",
  Now = "now",
  DBgenerated = "dbgenerated"
}

export interface IPrismaFieldOptions<T = any> {
  type?: ScalarType | Object | string; // TODO: type needs to accept user created types
  attr?: PostgresAttrType | MySQLAttrType | MongoAttrType | MssqlAttrType | CockroachDBAttrType | typeof FunctionAttr | string;
  isId?: boolean; // 100%
  isOptional?: boolean; // 100%
  isUnique?: boolean; // 100%
  prismaDefault?: PrismaDefault; // 50% function - pending 50%: static value based on type
  mapField?: string; // 100%
  name?: string; // 100%
}

export function prismaField<T = any>(options: IPrismaFieldOptions<T> = {}): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    if (!Reflect.hasMetadata("prisma:fields", target.constructor)) {
      Reflect.defineMetadata("prisma:fields", [], target.constructor);
    }
    
    const fields = Reflect.getMetadata("prisma:fields", target.constructor) as IPrismaFieldOptions[];
    const field: IPrismaFieldOptions = { 
      name : options.name || propertyKey.toString(),
      type: options.type || ScalarType.String || Object || String ,
      attr: options.attr || undefined,
      isId: options.isId || false,
      prismaDefault: options.prismaDefault || undefined,
      isOptional: options.isOptional || false,
      isUnique: options.isUnique || false,
      mapField: options.mapField || undefined,
    }

    //console.log(field);
    fields.push(field);
    Reflect.defineMetadata("prisma:fields", fields, target.constructor);
  };
}
