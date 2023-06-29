
export interface PropertyInfo {
    name: string;
    type: string;
    pathDeclaration?: string;
}
  
export type FileInfo = {
    file: string;
    imports: string[];
    exports: string[];
    defaultExport: string[];
    enums: { name: string; values: { [key: string]: number } }[];
    types: { name: string; properties: PropertyInfo[] }[];
    classes: { name: string; properties: PropertyInfo[] }[];
}