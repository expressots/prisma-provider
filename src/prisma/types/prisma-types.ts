import { ScalarType } from "./scalar-types";

export const enum Remarks {
  Unique = "@unique",
  CompositeUnique = "@@unique",
  Id = "@id",
  CompositeId = "@@id",
}





type FieldModifierOptions = "[]" | "?";
interface FieldModifier {
  name: string;
  type: ScalarType;
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
