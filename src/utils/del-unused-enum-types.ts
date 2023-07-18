import * as fs from "fs";

interface PrismaSchema {
    enums: string[];
    types: string[];
}

export default async function removeUnusedEnumsAndTypes(filePath: string): Promise<void> {
    let fileContent = fs.readFileSync(filePath, "utf8");

    const prismaSchema: PrismaSchema = {
        enums: [],
        types: [],
    };

    const enumRegex = /enum (\w+)/g;
    let enumMatch;
    while ((enumMatch = enumRegex.exec(fileContent)) !== null) {
        prismaSchema.enums.push(enumMatch[1]);
    }

    const typeRegex = /type (\w+)/g;
    let typeMatch;
    while ((typeMatch = typeRegex.exec(fileContent)) !== null) {
        prismaSchema.types.push(typeMatch[1]);
    }

    const usedEnums: Set<string> = new Set();
    const usedTypes: Set<string> = new Set();

    prismaSchema.enums.forEach((enumName) => {
        const enumRegex = new RegExp(`\\b${enumName}\\b`, "g");
        const matches = fileContent.match(enumRegex);
        if (matches && matches.length >= 2) {
            usedEnums.add(enumName);
        }
    });

    prismaSchema.types.forEach((typeName) => {
        const typeRegex = new RegExp(`\\b${typeName}\\b`, "g");
        const matches = fileContent.match(typeRegex);
        if (matches && matches.length >= 2) {
            usedTypes.add(typeName);
        }
    });

    const unusedEnums = prismaSchema.enums.filter((enumName) => !usedEnums.has(enumName));
    unusedEnums.forEach((enumName) => {
        const enumRegex = new RegExp(`enum ${enumName}(\\s*{[\\s\\S]*?}\\s*)?\\n`, "g");
        fileContent = fileContent.replace(enumRegex, "");
    });

    const unusedTypes = prismaSchema.types.filter((typeName) => !usedTypes.has(typeName));
    unusedTypes.forEach((typeName) => {
        const typeRegex = new RegExp(`type ${typeName}(\\s*{[\\s\\S]*?}\\s*)?\\n`, "g");
        fileContent = fileContent.replace(typeRegex, "");
    });

    fs.writeFileSync(filePath, fileContent);
}
