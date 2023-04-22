import { PrismaFieldOptions, PrismaFieldMapping } from "../decorators/prisma/prisma-decorator.provider";
import fs from "fs";
import path from "path";
import glob from "glob";

function generatePrismaModel(cls: any): void {

  const className = cls.name;
  const fields = (Reflect.getMetadata("prisma:fields", cls) as PrismaFieldOptions[]) || [];

  const fieldStrings = fields.map((field) => {
    const { name, type, isId, isOptional, isUnique, default: defaultValue, prismaDefault, relation, map, db } = field;

    let fieldString = `${name} ${type}`;

    if (isId) {
      fieldString += " @id";
    }

    if (isOptional) {
      fieldString += "?";
    }

    if (isUnique) {
      fieldString += " @unique";
    }

    if (prismaDefault) {
      fieldString += ` @default(${prismaDefault}())`;
    } else if (defaultValue !== undefined) {
      fieldString += ` @default(${JSON.stringify(defaultValue)})`;
    }

    if (relation) {
      const { fields: refFields, references: refReferences, referenceType: refForeign } = relation;
      fieldString += ` @relation(fields: [${refFields}], references: [${refReferences}])`;
      fieldString += `\n\t${refFields} ${refForeign}`;
    }

    if (map) {
      fieldString += ` @map("${map}")`;
    }

    if (db) {
      fieldString += ` @db.${db}`;
    }

    return fieldString;
  });

  const modelString = `model ${className} {\n  ${fieldStrings.join("\n  ")}\n}`;

  const schemaPath = path.join(__dirname, "..", "/orm", "prisma", "schema.prisma");
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");

  const modelRegex = new RegExp(`model ${className} {[^}]*}`, "g");
  const modelExists = modelRegex.test(schemaContent);

  let updatedContent;
  if (modelExists) {
    // Update the existing model
    updatedContent = schemaContent.replace(modelRegex, modelString);
  } else {
    // Add the new model after the [Models] comment
    updatedContent = schemaContent.replace("// [Models]", `// [Models]\n\n${modelString}`);
  }

  fs.writeFileSync(schemaPath, updatedContent);
}

async function generatePrismaModels(): Promise<void> {
  const entitiesPath = path.join(__dirname, "..", "..", "/entities");

  const files = glob.sync(`${entitiesPath}/**/*.entity.ts`);
  if (!files) {
    console.error("Error reading entity files");
    return;
  }

  for (const file of files) {
    const fileContent = fs.readFileSync(file, "utf-8");
    const classNameMatch = fileContent.match(/class\s+(\w+)/);

    if (!classNameMatch) {
      console.error(`Could not find class declaration in ${file}`);
      continue;
    }

    const className = classNameMatch[1];

    try {
      const module = await import(path.resolve(file));
      const EntityClass = module.default || module[className];
      generatePrismaModel(EntityClass);
    } catch (err) {
      console.error(`Error importing ${file}:`, err);
    }
  }
}


export { generatePrismaModels };
