//enums: { name: string; values: { [key: string]: number } }[];

import { FileInfo } from "../file-info";

export type EnumInfo = {
    name: string;
    values: { [key: string]: number };
};

export class EnumExtractor {
    public static enums(fileInfo: Array<FileInfo>): Array<EnumInfo> {
        const enums: Array<EnumInfo> = [];
        fileInfo.forEach((file) => {
            file.enums.forEach((enm) => {
                enums.push(enm);
            });
        });

        return enums;
    }

    public static byName(enums: Array<EnumInfo>, enumName: string): EnumInfo | undefined {
        return enums.find((enm) => enm.name === enumName);
    }
}
