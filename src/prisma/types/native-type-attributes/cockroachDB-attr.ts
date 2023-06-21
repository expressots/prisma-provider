enum CockroachDBTypesAttribute {
    String = "@db.String(x)",
    CharX = "@db.Char(x)",
    Char = "@db.CatalogSingleChar",
    Bit = "@db.Bit(x)",
    VarBit = "@db.VarBit",
    Uuid = "@db.Uuid",
    Inet = "@db.Inet"
}

export { CockroachDBTypesAttribute }