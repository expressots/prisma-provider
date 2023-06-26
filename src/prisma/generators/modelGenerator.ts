import fs from "fs";
import path from "path";
import glob from "glob";
import { IPrismaFieldOptions, IPrismaModelOptions } from "../decorators";
import { IPrismaIndexOptions } from "../decorators/index.decorator";
import TypeSearcher from "../../utils/typeSearcher";

const PROJECT_ROOT = path.join(__dirname, "..", "..", "..", "src");

async function removePrismaModels(): Promise<void> {
  const entitiesPath = path.join(PROJECT_ROOT, 'demo', 'entities');

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

  const model = (Reflect.getMetadata("prisma:model", cls) as IPrismaModelOptions) || false;
  const indexOptions = (Reflect.getMetadata("prisma:index", cls) as IPrismaIndexOptions[]) || [];

  if (model) {
    const className = cls.name;
    const fields = (Reflect.getMetadata("prisma:fields", cls) as IPrismaFieldOptions[]) || [];

    const idFields: string[] = [];
    const uniqueFields: string[] = [];
    const typesorenuns: string[] = [];

    const fieldStrings = fields.map((field) => {
      const { name, type, attr, isId, isOptional, isUnique, prismaDefault, mapField } = field;

      let fieldString = `${name} ${type}`;

      if (attr) {
        fieldString += ` ${attr}`;
      }

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

      if (typeof type === "string") {
        typesorenuns.push(type);
      }

      return fieldString;
    });

    // TODO: see how to search for enums and types using imports and the file itself
    if (typesorenuns.length > 0) {
      for (const type of typesorenuns) {
        const newEnum = new TypeSearcher(type, './')
        const enumPrisma = newEnum.search();
        if (enumPrisma === undefined) {
          continue;
        }
        // Save on schema.prisma
        const schemaPath = path.join(PROJECT_ROOT, "demo/orm/prisma", "/schema.prisma");
        const schemaContent = fs.readFileSync(schemaPath, "utf-8");

        const enumRegex = new RegExp(`enum ${type} {[^}]*}`, "g");
        const enumExists = enumRegex.test(schemaContent);
        let updatedContent;
        if (enumExists) {
          // Update the existing model
          updatedContent = schemaContent.replace(enumRegex, enumPrisma);
        } else {
        // Add the new model after the [Models] comment
        updatedContent = schemaContent.replace("// [Enums]", `// [Enums]\n\n${enumPrisma}`);
        }	
        fs.writeFileSync(schemaPath, updatedContent);
      }
    }

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
    if (model.map) {
      const modelRegex = new RegExp(`(model ${className} {[^}]*)`, "g");
      updatedContent = updatedContent.replace(modelRegex, `$1\n  @@map("${model.map}")\n`);
    }

    // Add @@index model annotation
    if (indexOptions) {
      for (const index of indexOptions) {
        const modelRegex = new RegExp(`(model ${className} {[^}]*)`, "g");
        const indexString = index.fields.join(', ');

        const map: string = index.map ? `map: "${index.map}"` : "";
        const name: string = index.name ? `name: "${index.name}"` : "";
        const type: string = index.type ? `type: ${index.type}` : "";

        let mapping: Array<any> = [];
        mapping.push(`[${indexString}]`);
        if (map) mapping.push(map);
        if (name) mapping.push(name);
        if (type) mapping.push(type);

        const indexGrouping = mapping.join(', ');
        updatedContent = updatedContent.replace(modelRegex, `$1\n  @@index(${indexGrouping})\n`);
      }
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
      updatedContent = schemaContent.replace(modelRegex, '');
      fs.writeFileSync(schemaPath, updatedContent);
    }
  }
}

async function readAllEntities(): Promise<void> {
  const entitiesPath = path.join(PROJECT_ROOT, "demo", "/entities");

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
      const entityClass = module.default || module[className];
      generatePrismaModel(entityClass);
    } catch (err) {
      console.error(`Error importing ${file}:`, err);
    }
  }
}

function codeFirstGen(): void {
  readAllEntities();
}

export { codeFirstGen, removePrismaModels };