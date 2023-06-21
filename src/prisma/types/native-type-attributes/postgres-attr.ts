import { ScalarType } from "../scalar-types";


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

const ScalarTypeAttributesMap = (scalarType: ScalarType, attribute?: StringAttributesPostgres): string => {
    
    let postgresAttribute:string = DefaultAttributesPostgres[scalarType];

   // mapping to specific attributes
    switch (scalarType) {
        case ScalarType.String:
            postgresAttribute = attribute? attribute : postgresAttribute;
            break;
        // Add similar case checks for ScalarType.Int, ScalarType.Float, etc.
    }
    
    return postgresAttribute || "";
}

export { ScalarTypeAttributesMap, StringAttributesPostgres }




/* import { ScalarType } from "../scalar-types"

const DefaultAttributesPostgres = {
    String: "@db.Text",
    Boolean: "@db.Boolean",
    Int: "@db.Integer",
    BigInt: "@db.BigInt",
    Float: "@db.DoublePrecision",
    Decimal: "@db.Decimal(x, y)",
    DateTime: "@db.Timestamp(x)",
    Json: "@db.JsonB",
    Bytes: "@db.ByteA",
    UUID: "String",
}

const StringAttributesPostgres = {
    Text: "@db.Text",
    Char: "@db.Char(x)",
    VarChar: "@db.VarChar(x)",
    Bit: "@db.Bit(x)",
    VarBit: "@db.VarBit",
    Uuid: "@db.Uuid",
    Xml: "@db.Xml",
    Inet: "@db.Inet",
    Citext: "@db.Citext"
}

const IntAttributesPostgres = {
    SmallInt: "@db.SmallInt",
    Oid: "@db.Oid"
}

const FloatAttributesPostgres = {
    Real: "@db.Real"
}

const DecimalAttributesPostgres = {
    Money: "@db.Money"
}

const DateTimeAttributesPostgres = {
    Timestamptz: "@db.Timestamptz(x)",
    Date: "@db.Date",
    Time: "@db.Time(x)",
    TimeTZ: "@db.Timetz(x)"
}

const JsonAttributesPostgres = {
    Json: "@db.Json"
}

const ScalarTypeAttributesMap = (scalarType: ScalarType, attribute: string): string => {
    // mapping to default attributes
    let postgresAttribute = DefaultAttributesPostgres[scalarType];

    // mapping to specific attributes
    if (scalarType === ScalarType.String && attribute in StringAttributesPostgres) {
        postgresAttribute = StringAttributesPostgres[attribute];
    } else if (scalarType === ScalarType.Int && attribute in IntAttributesPostgres) {
        postgresAttribute = IntAttributesPostgres[attribute];
    } else if (scalarType === ScalarType.Float && attribute in FloatAttributesPostgres) {
        postgresAttribute = FloatAttributesPostgres[attribute];
    } else if (scalarType === ScalarType.Decimal && attribute in DecimalAttributesPostgres) {
        postgresAttribute = DecimalAttributesPostgres[attribute];
    } else if (scalarType === ScalarType.DateTime && attribute in DateTimeAttributesPostgres) {
        postgresAttribute = DateTimeAttributesPostgres[attribute];
    } else if (scalarType === ScalarType.Json && attribute in JsonAttributesPostgres) {
        postgresAttribute = JsonAttributesPostgres[attribute];
    }
    
    return postgresAttribute || "";
}

export { ScalarTypeAttributesMap, StringAttributesPostgres } */