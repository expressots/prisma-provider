enum TypesAttributeMySQL {
    Varchar = "@db.VarChar(x)",
    Text = "@db.Text",
    Char = "@db.Char(x)",
    TinyText = "@db.TinyText",
    MediumText = "@db.MediumText",
    LongText = "@db.LongText",
}

enum BooleanAttrMySQL {
    TinyInt = "@db.TinyInt(x)",
    Bit = "@db.Bit",
}

enum IntAttrMySQL {
    Int = "@db.Int",
    UInt = "@db.UnsignedInt",
    SmallInt = "@db.SmallInt",
    USmallInt = "@db.UnsignedSmallInt",
    MediumInt = "@db.MediumInt",
    UMediumInt = "@db.UnsignedMediumInt",
    TinyIint = "@db.TinyInt",
    UTinyInt = "@db.UnsignedTinyInt",
    Year = "@db.Year",
}

enum BigIntAttrMySQL {
    BigInt = "@db.BigInt",
    Serial = "@db.UnsignedBigInt",
}

enum FloatAttrMySQL {
    Float = "@db.Float",
    Double = "@db.Double",
}

enum DecimalAttrMySQL {
    Decimal = "@db.Decimal(p, s)",
}

enum DateTimeAttrMySQL {
    AteTime = "@db.DateTime(x)",
    Date = "@db.Date(x)",
    Time = "@db.Time(x)",
    TimeStamp = "@db.Timestamp(x)",
}

enum JsonAttrMySQL {
    Json = "@db.Json",
}

enum BytesAttrMySQL {
    LongBlob = "@db.LongBlob",
    Binary = "@db.Binary",
    VarBinary = "@db.VarBinary",
    TinyBlob = "@db.TinyBlob",
    Blob = "@db.Blob",
    MediumBlob = "@db.MediumBlob",
    Bit = "@db.Bit",
}

export type MySQLAttrType =
    | TypesAttributeMySQL
    | BooleanAttrMySQL
    | IntAttrMySQL
    | BigIntAttrMySQL
    | FloatAttrMySQL
    | DecimalAttrMySQL
    | DateTimeAttrMySQL
    | JsonAttrMySQL
    | BytesAttrMySQL;
export const MySQLAttr = {
    ...TypesAttributeMySQL,
    ...BooleanAttrMySQL,
    ...IntAttrMySQL,
    ...BigIntAttrMySQL,
    ...FloatAttrMySQL,
    ...DecimalAttrMySQL,
    ...DateTimeAttrMySQL,
    ...JsonAttrMySQL,
    ...BytesAttrMySQL,
};
