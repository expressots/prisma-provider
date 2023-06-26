import fs from 'fs';
import glob from 'glob';

// function to transform the enum to prisma format
function transformEnum(enumName: string, enumValues: string[]): string {
  const prismaEnumValues = enumValues.map(value => value.toUpperCase()).join("\n  ");
  return `enum ${enumName} {
  ${prismaEnumValues}
}`;
}

class TypeSearcher {
  constructor(private searchName: string, private searchPath: string) {}

  public search(): string | undefined {
    const files = glob.sync(`${this.searchPath}/**/*.ts`);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');

      if (content.includes(this.searchName)) {
        const enumRegex = new RegExp(`enum\\s+${this.searchName}\\s*\\{([\\s\\S]*?)\\}`, "g");
        const typeRegex = new RegExp(`type\\s+${this.searchName}\\s*\\{([\\s\\S]*?)\\}`, "g");
        
        const enumMatch = enumRegex.exec(content);
        const typeMatch = typeRegex.exec(content);

        if (enumMatch) {
          const enumDeclaration = enumMatch[1];
        
          if (enumDeclaration) {
            const enumName = this.searchName;
            const enumValues = enumDeclaration.split(",")
              .map(value => value.trim().split("=")[0].trim()) // Remove values after "="
              .filter(value => value); // Remove empty values
            const prismaEnum = transformEnum(enumName, enumValues);
        
            return prismaEnum;
          }
        } else if (typeMatch) {
          // Logic to process the types
        }
      }
    }
  }
}

export default TypeSearcher;