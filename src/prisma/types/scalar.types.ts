const enum ScalarType {
    String = "String",
    Boolean = "Boolean",
    Int = "Int",
    BigInt = "BigInt",
    Float = "Float",
    Decimal = "Decimal",
    DateTime = "DateTime",
    Json = "Json",
    Bytes = "Bytes",
    Enum = "Enum",
}

const ScalarTypeMap: String[] = [
    "String",
    "Boolean",
    "Int",
    "BigInt",
    "Float",
    "Decimal",
    "DateTime",
    "Json",
    "Bytes",
    "Enum",
];

export { ScalarType, ScalarTypeMap };
