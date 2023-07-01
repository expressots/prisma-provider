enum StringAttributesCockroachDB {
    String = "@db.String(x)",
    CharX = "@db.Char(x)",
    "Char" = "@db.CatalogSingleChar",
    Bit = "@db.Bit(x)",
    VarBit = "@db.VarBit",
    Uuid = "@db.Uuid",
    Inet = "@db.Inet",
}

enum BooleanAttributesCockroachDB {
    Bool = "@db.Bool",
}

enum IntAttributesCockroachDB {
    Int = "@db.Int8",
    Int4 = "@db.Int4",
    SmallInt = "@db.Int2",
}

enum BigIntAttributesCockroachDB {
    BigInt = "@db.Int8",
}

enum FloatAttributesCockroachDB {
    Float = "@db.Float8",
    Float4 = "@db.Float4",
}

enum DecimalAttributesCockroachDB {
    Decimal = "@db.Decimal(x, y)",
}

enum DateTimeAttributesCockroachDB {
    Timestamp = "@db.Timestamp(x)",
    Timestamptz = "@db.Timestamptz(x)",
    Date = "@db.Date",
    Time = "@db.Time(x)",
    Timetz = "@db.Timetz(x)",
}

enum JsonAttributesCockroachDB {
    Json = "@db.Json",
}

enum BytesAttibutesCockroachDB {
    Bytes = "@db.Bytes",
}

export type CockroachDBAttrType =
    | StringAttributesCockroachDB
    | BooleanAttributesCockroachDB
    | IntAttributesCockroachDB
    | BigIntAttributesCockroachDB
    | FloatAttributesCockroachDB
    | DecimalAttributesCockroachDB
    | DateTimeAttributesCockroachDB
    | JsonAttributesCockroachDB
    | BytesAttibutesCockroachDB;
export const CockroachDBAttr = {
    ...StringAttributesCockroachDB,
    ...BooleanAttributesCockroachDB,
    ...IntAttributesCockroachDB,
    ...BigIntAttributesCockroachDB,
    ...FloatAttributesCockroachDB,
    ...DecimalAttributesCockroachDB,
    ...DateTimeAttributesCockroachDB,
    ...JsonAttributesCockroachDB,
    ...BytesAttibutesCockroachDB,
};
