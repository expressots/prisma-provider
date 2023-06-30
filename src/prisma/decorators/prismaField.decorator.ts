import { fn } from './../types/typeAttributes/attr-function';
import { MongoAttrType } from './../types/typeAttributes/mongo-attr';
import { ScalarType } from "../types/scalar.types";
import { PostgresAttrType } from "../types/typeAttributes/postgres-attr";
import { MySQLAttrType } from "../types/typeAttributes/mysql-attr";
import { MssqlAttrType } from "../types/typeAttributes/msql-attr";
import { CockroachDBAttrType } from "../types/typeAttributes/cockroachDB-attr";

export const Default = {
  Auto: "auto()",
  AutoIncrement: "autoincrement()",
  Sequence: "sequence()",
  Cuid: "cuid()",
  Uuid: "uuid()",
  Now: "now()",
  DBgenerated: "dbgenerated()",
  Value: (value: any) => typeof value === "string" ? `"${value}"` : value,
}

export interface IPrismaFieldOptions<T = any> {
  type?: ScalarType | Object | string;
  attr?: PostgresAttrType 
  | MySQLAttrType 
  | MongoAttrType 
  | MssqlAttrType 
  | CockroachDBAttrType 
  | typeof fn | string;
  isId?: boolean;
  isOptional?: boolean;
  isUnique?: boolean;
  prismaDefault?: typeof Default | string;
  mapField?: string;
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
      type: options.type || ScalarType.String || Object || String ,
      attr: options.attr || undefined,
      isId: options.isId || false,
      prismaDefault: options.prismaDefault || undefined,
      isOptional: options.isOptional || false,
      isUnique: options.isUnique || false,
      mapField: options.mapField || undefined,
    }

    fields.push(field);
    Reflect.defineMetadata("prisma:fields", fields, target.constructor);
  };
}
