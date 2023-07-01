enum MssqlTypesAttribute {
    Char = "@db.Char(x)",
    NChar = "@db.NChar(x)",
    VarChar = "@db.VarChar(x)",
    NVarChar = "@db.NVarChar(x)",
    Text = "@db.Text",
    NText = "@db.NText",
    Xml = "@db.Xml",
    UniqueIdentifier = "@db.UniqueIdentifier",
    Bit = "@db.Bit",
}

enum StringAttributesMsql {
    Char = "@db.Char(x)",
    Nchar = "@db.NChar(x)",
    Varchar = "@db.VarChar(x)",
    NVarchar = "@db.NVarChar(x)",
    Text = "@db.Text",
    NText = "@db.NText",
    Xml = "@db.Xml",
    Uniqueidentifier = "@db.UniqueIdentifie",
}
enum BooleanAttributesMsql {
    Bit = "@db.Bit",
}

enum IntAttributesMsql {
    Int = "@db.Int",
    SmallInt = "@db.SmallInt",
    TinyInt = "@db.TinyInt",
    Bit = "@db.Bit",
}

enum BigIntAttributesMsql {
    BigInt = "@db.BigInt",
}

enum FloatAttributesMsql {
    Float = "@db.Float",
    Money = "@db.Money",
    Smallmoney = "@db.Smallmoney",
    Real = "@db.Real",
}

enum DecimalAttributesMsql {
    Decimal = "@db.Decimal(x, y)",
}

enum DateTimeAttributesMsql {
    Date = "@db.Date",
    Time = "@db.Time",
    Datetime = "@db.Datetime",
    Datetime2 = "@db.Datetime2",
    Smalldatetime = "@db.SmallDateTime",
    Datetimeoffset = "@db.Datetimeoffset",
}

enum JsonAttributesMsql {
    Json = "@db.NVarChar",
}

enum BytesAttributesMsql {
    Binary = "@db.Binary",
    Varbinary = "@db.Varbinary",
    Image = "@db.Image",
}

export type MssqlAttrType =
    | MssqlTypesAttribute
    | StringAttributesMsql
    | BooleanAttributesMsql
    | IntAttributesMsql
    | BigIntAttributesMsql
    | FloatAttributesMsql
    | DecimalAttributesMsql
    | DateTimeAttributesMsql
    | JsonAttributesMsql
    | BytesAttributesMsql;
export const MssqlAttr = {
    ...MssqlTypesAttribute,
    ...StringAttributesMsql,
    ...BooleanAttributesMsql,
    ...IntAttributesMsql,
    ...BigIntAttributesMsql,
    ...FloatAttributesMsql,
    ...DecimalAttributesMsql,
    ...DateTimeAttributesMsql,
    ...JsonAttributesMsql,
    ...BytesAttributesMsql,
};
