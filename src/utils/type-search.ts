import fs from "fs";
import { type } from "../prisma/types/scalar.types";

function convertType(typeParam: string): string {
    switch (typeParam) {
        case "string":
            return type.String;
        case "boolean":
            return type.Boolean;
        case "number":
            return type.Int;
        default:
            return typeParam;
    }
}

function transformEnum(enumName: string, enumValues: Array<string>): string {
    const prismaEnumValues = enumValues.map((value) => value.toUpperCase()).join("\n  ");
    return `enum ${enumName} {
  ${prismaEnumValues}
}`;
}

function transformType(typeName: string, typeFields: Array<string>): string {
    const prismaTypeFields = typeFields
        .map((field) => {
            const [fieldName, fieldType] = field.split(":").map((part) => part.trim());
            const prismaFieldType = convertType(fieldType.replace(";", ""));
            return `${fieldName} ${prismaFieldType}`;
        })
        .join("\n  ");

    return `type ${typeName} {
  ${prismaTypeFields}
}`;
}

export default function typeSearcher(searchName: string, searchPath: string): string | undefined {
    const content = fs.readFileSync(searchPath, "utf-8");

    if (content.includes(searchName)) {
        const enumRegex = new RegExp(`enum\\s+${searchName}\\s*\\{([\\s\\S]*?)\\}`, "g");
        const typeRegex = new RegExp(`type\\s+${searchName}\\s*=\\s*{([\\s\\S]*?)}`, "g");

        const enumMatch = enumRegex.exec(content);
        const typeMatch = typeRegex.exec(content);

        if (enumMatch) {
            const enumDeclaration = enumMatch[1];

            if (enumDeclaration) {
                const enumName = searchName;
                const enumValues = enumDeclaration
                    .split(",")
                    .map((value) => value.trim().split("=")[0].trim()) // Remove values after "="
                    .filter((value) => value); // Remove empty values
                const prismaEnum = transformEnum(enumName, enumValues);

                return prismaEnum;
            }
        } else if (typeMatch) {
            const typeDeclaration = typeMatch[1];

            if (typeDeclaration) {
                const typeName = searchName;
                const typeFields = typeDeclaration
                    .split("\n")
                    .map((field) => field.trim())
                    .filter((field) => field); // Remover linhas vazias
                const prismaType = transformType(typeName, typeFields);

                return prismaType;
            }
        }
    }
}
