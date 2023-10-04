import { FileInfo, PropertyInfo } from "../file-info";
export type TypeInfo = {
    name: string;
    properties: Array<PropertyInfo>;
};

export class TypeExtractor {
    public static types(fileInfo: Array<FileInfo>): Array<TypeInfo> {
        const types: Array<TypeInfo> = [];
        fileInfo.forEach((file) => {
            file.types.forEach((typ) => {
                types.push(typ);
            });
        });

        return types;
    }

    public static byName(types: Array<TypeInfo>, typeName: string): TypeInfo | undefined {
        return types.find((typ) => typ.name === typeName);
    }
}
