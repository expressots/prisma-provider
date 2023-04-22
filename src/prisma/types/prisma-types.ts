export const enum Remarks {
  Unique = "@unique",
  CompositeUnique = "@@unique",
  Id = "@id",
  CompositeId = "@@id",
}

export enum PrismaFieldScalarType {
  String = "String",
  Boolean = "Boolean",
  Int = "Int",
  BigInt = "BigInt",
  Float = "Float",
  Decimal = "Decimal",
  DateTime = "DateTime",
  Json = "Json",
  Bytes = "Bytes",
  UUID = "String",
}

type FieldModifierOptions = "[]" | "?";
interface FieldModifier {
  name: string;
  type: PrismaFieldScalarType;
  modifiers?: FieldModifierOptions;
}

export type PrismaAttribute =
  | "@id"
  | "@@id"
  | "@default"
  | "@unique"
  | "@@unique"
  | "@@index"
  | "@relation"
  | "@map"
  | "@@map"
  | "@updatedAt"
  | "@ignore"
  | "@@ignore"
  | "@@schema";

export interface PrismaAttributeFunction {
  auto: () => string;
  autoincrement: () => string;
  sequence: () => string;
  cuid: () => string;
  uuid: () => string;
  now: () => string;
  dbgenerated: () => string;
}

export const prismaAttributeFunction: PrismaAttributeFunction = {
  auto: () => "auto()",
  autoincrement: () => "autoincrement()",
  sequence: () => "sequence()",
  cuid: () => "cuid()",
  uuid: () => "uuid()",
  now: () => "now()",
  dbgenerated: () => "dbgenerated()",
};
