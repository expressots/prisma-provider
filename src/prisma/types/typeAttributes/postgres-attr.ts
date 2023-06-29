enum StringAttrPostgres {
    Text = "@db.Text",
    Char = "@db.Char(x)",
    VarChar = "@db.VarChar(x)",
    Bit = "@db.Bit(x)",
    VarBit = "@db.VarBit",
    Uuid = "@db.Uuid",
    Xml = "@db.Xml",
    Inet = "@db.Inet",
    Citext = "@db.Citext"
}

enum IntAttrPostgres {
    SmallInt = "@db.SmallInt",
    Oid = "@db.Oid"
}

enum FloatAttrPostgres {
    Real = "@db.Real"
}

enum DecimalAttrPostgres {
    Decimal = "@db.Decimal(p, s)",
    Money = "@db.Money"
}

enum DateTimeAttrPostgres {
    Timestamptz = "@db.Timestamptz(x)",
    Date = "@db.Date",
    Time = "@db.Time(x)",
    TimeTZ = "@db.Timetz(x)"
}

enum JsonAttrPostgres {
    Json = "@db.Json"
}

export type PostgresAttrType = StringAttrPostgres | IntAttrPostgres | FloatAttrPostgres | DecimalAttrPostgres | DateTimeAttrPostgres | JsonAttrPostgres;
export const PostgresAttr = { ...StringAttrPostgres, ...IntAttrPostgres, ...FloatAttrPostgres, ...DecimalAttrPostgres, ...DateTimeAttrPostgres, ...JsonAttrPostgres };