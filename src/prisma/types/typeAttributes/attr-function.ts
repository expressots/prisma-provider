enum AttrFunctionsOptions {
    Decimal = "Decimal",
}

const Function = {
    Decimal: (p: number, s: number) => `@db.Decimal(${p}, ${s})`
}

export const FunctionAttr = { ...AttrFunctionsOptions, ...Function };