enum DefaultAttributesPostgres {
    String = "@db.Text",
    Boolean = "@db.Boolean",
    Int = "@db.Integer",
    BigInt = "@db.BigInt",
    Float = "@db.DoublePrecision",
    Decimal = "@db.Decimal(x, y)",
    DateTime = "@db.Timestamp(x)",
    Json = "@db.JsonB",
    Bytes = "@db.ByteA",
    UUID = "String",
}

enum StringAttributesPostgres {
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

enum IntAttributesPostgres {
    SmallInt = "@db.SmallInt",
    Oid = "@db.Oid"
}

enum FloatAttributesPostgres {
    Real = "@db.Real"
}

enum DecimalAttributesPostgres {
    Money = "@db.Money"
}

enum DateTimeAttributesPostgres {
    Timestamptz = "@db.Timestamptz(x)",
    Date = "@db.Date",
    Time = "@db.Time(x)",
    TimeTZ = "@db.Timetz(x)"
}

enum JsonAttributesPostgres {
    Json = "@db.Json"
}