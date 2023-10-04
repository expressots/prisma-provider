export interface PropertyInfo {
    name: string;
    type: string;
    pathDeclaration?: string;
}

export type FileInfo = {
    file: string;
    imports: Array<string>;
    exports: Array<string>;
    defaultExport: Array<string>;
    enums: Array<{ name: string; values: { [key: string]: number } }>;
    types: Array<{ name: string; properties: Array<PropertyInfo> }>;
    classes: Array<{ name: string; properties: Array<PropertyInfo> }>;
};
