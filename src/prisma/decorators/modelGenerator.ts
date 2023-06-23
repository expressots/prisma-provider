import fs from "fs";
import path from "path";
import glob from "glob";
import { PrismaFieldOptions } from ".";
import { PrismaModelOptions } from "./prismaModel.decorator";

const PROJECT_ROOT = path.join(__dirname, "..", "..", "..", "src");

async function removePrismaModels(): Promise<void> {
  const entitiesPath = path.join(PROJECT_ROOT, 'demo', 'entities');
  console.log('entitiesPath', entitiesPath);

  try {
    const files = glob.sync(`${entitiesPath}/**/*.entity.ts`);
    if (!files.length) {
      console.error('Error reading entity files');
      return;
    }

    const schemaPath = path.join(PROJECT_ROOT, 'demo', 'orm', 'prisma', 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

    // Regular expression to find models in the schema.prisma file
    const modelRegex = /model [^}]* {[^}]*}/g;
    const models = Array.from(schemaContent.matchAll(modelRegex), (m) => m[0]);

    const news: string[] = [];
    for (const file of files) {
      const fileContent = fs.readFileSync(file, 'utf-8');
      const classNameMatch = fileContent.match(/class\s+(\w+)/);
      // console.log(classNameMatch);
      if (!classNameMatch) {
        console.error(`Could not find class declaration in ${file}`);
        continue;
      }
      const className = classNameMatch[1];
      // Import the module from the entity file
      const modelString = `model ${className}`;
      news.push(modelString);
    }

    // Create an array with the models found in schema.prisma, removing extra whitespace
    const inPrisma: string[] = models.map((model) => model.trim());
    // Filter out the models found in schema.prisma that are not present in the new models list
    const retorno = inPrisma.filter((item) => !news.some((substring) => item.includes(substring)));
    let updatedContent = schemaContent;
    for (const item of retorno) {
      // Remove the old models from the file content
      updatedContent = updatedContent.replace(item, '');
    }

    // Write the updated content to the schema.prisma file
    fs.writeFileSync(schemaPath, updatedContent);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

function generatePrismaModel(cls: any): void {

  const model = (Reflect.getMetadata("prisma:model", cls) as PrismaModelOptions) || false;

  if (model) {
    const className = cls.name;
    const fields = (Reflect.getMetadata("prisma:fields", cls) as PrismaFieldOptions[]) || [];

    console.log(fields);

    const idFields: string[] = [];
    const uniqueFields: string[] = [];

    const fieldStrings = fields.map((field) => {
      const { name, type, isId, isOptional, isUnique, prismaDefault, mapField, db } = field;

      let fieldString = `${name} ${type}`;

      if (isOptional == true) {
        fieldString += "?";
      } else {
        fieldString += "";
      }

      if (isId) {
        idFields.push(name!);
      }

      if (isUnique) {
        uniqueFields.push(name!);
      }

      if (prismaDefault) {
        fieldString += ` @default(${prismaDefault}())`;
      }

      if (mapField) {
        fieldString += ` @map("${mapField}")`;
      }

      if (db) {
        fieldString += ` @db.${db}`;
      }

      return fieldString;
    });

    const modelString = `model ${className} {\n  ${fieldStrings.join("\n  ")}\n}`;

    const schemaPath = path.join(PROJECT_ROOT, "demo/orm/prisma", "/schema.prisma");
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

    // Join the idFields with comma separation and add them as a new fieldString if there's more than one id field
    if (idFields.length > 1) {
      const idFieldsString = `@@id([${idFields.join(", ")}])`;
      const modelRegex = new RegExp(`(model ${className} {[^}]*)`, "g");
      updatedContent = updatedContent.replace(modelRegex, `$1\n  ${idFieldsString}\n`);    
    } else if (idFields.length === 1) {
      updatedContent = updatedContent.replace(
        new RegExp(`(${idFields[0]} [A-Za-z]*)`),
        `$1 @id`
      )
    }

    // Join the uniqueFields with comma separation and add them as a new fieldString if there's more than one unique field
    if (uniqueFields.length > 1) {
      const uniqueFieldsString = `@@unique([${uniqueFields.join(", ")}])`;
      const modelRegex = new RegExp(`(model ${className} {[^}]*)`, "g");
      updatedContent = updatedContent.replace(modelRegex, `$1\n  ${uniqueFieldsString}\n`);
    } else if (uniqueFields.length === 1) {
      updatedContent = updatedContent.replace(
        new RegExp(`(${uniqueFields[0]} [A-Za-z]*)`),
        `$1 @unique`
      )
    }

    // Add @@map model annotation
    console.log(model.map);
    if (model.map) {
      const modelRegex = new RegExp(`(model ${className} {[^}]*)`, "g");
      updatedContent = updatedContent.replace(modelRegex, `$1\n  @@map("${model.map}")\n`);
    }

    fs.writeFileSync(schemaPath, updatedContent);
  } else {
    const className = cls.name;
    const schemaPath = path.join(PROJECT_ROOT, "demo/orm/prisma", "/schema.prisma");
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    const modelRegex = new RegExp(`model ${className} {[^}]*}`, "g");
    const modelExists = modelRegex.test(schemaContent);

    let updatedContent;
    if (modelExists) { 
      // TODO: this replace not remove empty line on schema.prisma
      // Need to fix this later for remove empty lines on schema.prisma
      updatedContent = schemaContent.replace(modelRegex, '');
      fs.writeFileSync(schemaPath, updatedContent);
    }
  }
  
}

async function readAllEntities(): Promise<void> {
  const entitiesPath = path.join(PROJECT_ROOT, "demo", "/entities");
  console.log("entitiesPath", entitiesPath);

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

function codeFirstGen(): void {
    readAllEntities();
}

export { codeFirstGen, removePrismaModels};