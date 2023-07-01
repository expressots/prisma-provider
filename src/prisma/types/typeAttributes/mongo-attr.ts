enum StringAttrMongo {
    String = "@db.String",
    ObjectID = "@db.ObjectId",
}

enum IntAttrMongo {
    Int = "@db.String",
    Long = "@db.Long",
}

enum BigIntAttrMongo {
    bigint = "@db.BigInt",
}

enum BytesAttrMongo {
    BinData = "@db.BinData",
}

export type MongoAttrType = StringAttrMongo | IntAttrMongo | BigIntAttrMongo | BytesAttrMongo;
export const MongoAttr = {
    ...StringAttrMongo,
    ...IntAttrMongo,
    ...BigIntAttrMongo,
    ...BytesAttrMongo,
};
