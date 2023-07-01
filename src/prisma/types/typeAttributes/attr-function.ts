export const Postgres = {
    Bit: (length: number) => `@db.Bit(${length})`,
    Char: (length: number) => `@db.Char(${length})`,
    Decimal: (precision: number, scale: number) => `@db.Decimal(${precision}, ${scale})`,
    Varchar: (length: number) => `@db.VarChar(${length})`,
    Timestamp: (precision: number) => `@db.Timestamp(${precision})`,
    Timestamptz: (precision: number) => `@db.Timestamptz(${precision})`,
    Time: (precision: number) => `@db.Time(${precision})`,
    Timetz: (precision: number) => `@db.Timetz(${precision})`,
};

export const MySQL = {
    Char: (length: number) => `@db.Char(${length})`,
    Decimal: (precision: number, scale: number) => `@db.Decimal(${precision}, ${scale})`,
    DateTime: (precision: number) => `@db.DateTime(${precision})`,
    Time: (precision: number) => `@db.Time(${precision})`,
    Timestamp: (precision: number) => `@db.Timestamp(${precision})`,
    TinyInt: (length: number) => `@db.TinyInt(${length})`,
    Varchar: (length: number) => `@db.VarChar(${length})`,
};

export const MSQL = {
    Char: (length: number) => `@db.Char(${length})`,
    Decimal: (precision: number, scale: number) => `@db.Decimal(${precision}, ${scale})`,
    Nchar: (length: number) => `@db.NChar(${length})`,
    Varchar: (length: number) => `@db.VarChar(${length})`,
    Nvarchar: (length: number) => `@db.NVarChar(${length})`,
};

export const CockroachDB = {
    Bit: (length: number) => `@db.Bit(${length})`,
    Char: (length: number) => `@db.Char(${length})`,
    String: (length: number) => `@db.String(${length})`,
    Timestamp: (precision: number) => `@db.Timestamp(${precision})`,
    Timestamptz: (precision: number) => `@db.Timestamptz(${precision})`,
    Time: (precision: number) => `@db.Time(${precision})`,
    Timetz: (precision: number) => `@db.Timetz(${precision})`,
};

export const SQLite = {
    Decimal: (precision: number, scale: number) => `@db.Decimal(${precision}, ${scale})`,
};

export const fn = { Postgres, MySQL, MSQL, CockroachDB, SQLite };
