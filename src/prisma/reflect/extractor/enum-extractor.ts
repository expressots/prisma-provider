//enums: { name: string; values: { [key: string]: number } }[];

import { FileInfo } from "../file-info";

export type EnumInfo = {
    name: string;
    values: { [key: string]: number };
};

export class EnumExtractor {
    //extracts all enums from all files
    public static enums(fileInfo: FileInfo[]): EnumInfo[] {
        const enums: EnumInfo[] = [];
        fileInfo.forEach((file) => {
            file.enums.forEach((enm) => {
                enums.push(enm);
            });
        });

        return enums;
    }

    public static byName(enums: EnumInfo[], enumName: string): EnumInfo | undefined {
        return enums.find((enm) => enm.name === enumName);
    }
}
