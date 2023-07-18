import { FileInfo, PropertyInfo } from "../file-info";
export type TypeInfo = {
    name: string;
    properties: PropertyInfo[];
};

export class TypeExtractor {
    public static types(fileInfo: FileInfo[]): TypeInfo[] {
        const types: TypeInfo[] = [];
        fileInfo.forEach((file) => {
            file.types.forEach((typ) => {
                types.push(typ);
            });
        });

        return types;
    }

    public static byName(types: TypeInfo[], typeName: string): TypeInfo | undefined {
        return types.find((typ) => typ.name === typeName);
    }
}
