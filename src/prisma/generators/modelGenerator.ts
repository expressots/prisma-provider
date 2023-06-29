import fs from "fs";
import glob from "glob";
import path from "path";
import { IPrismaFieldOptions, IPrismaModelOptions } from "../decorators";
import { IPrismaIndexOptions } from "../decorators/index.decorator";
import { reflect } from "../reflect/reflect";
import { ScalarType, ScalarTypeMap } from "../types";
import { FileInfo } from "../reflect/file-info";
import { ClassExtractor } from "../reflect/extractor/class-extractor";

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
    const results = inPrisma.filter((item) => !news.some((substring) => item.includes(substring)));
    let updatedContent = schemaContent;
    for (const item of results) {
      // Remove the old models from the file content
      updatedContent = updatedContent.replace(item, '');
    }

    // Write the updated content to the schema.prisma file
    fs.writeFileSync(schemaPath, updatedContent);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

function generatePrismaModel(cls: any, filePath: string): void {
  const reflectInfo: FileInfo[] = reflect({fileArray: [filePath]});
  
  const model = (Reflect.getMetadata("prisma:model", cls) as IPrismaModelOptions) || false;
  const indexOptions = (Reflect.getMetadata("prisma:index", cls) as IPrismaIndexOptions[]) || [];
  
  if (model) {
    const className = cls.name;
    const fields = (Reflect.getMetadata("prisma:fields", cls) as IPrismaFieldOptions[]) || [];
    const classInfo = ClassExtractor.byName(ClassExtractor.classes(reflectInfo), className);

    const idFields: string[] = [];
    const uniqueFields: string[] = [];
    const typesOrEnums: string[] = [];
    
    const fieldStrings = fields.map((field) => {
      const { name, type, attr, isId, isOptional, isUnique, prismaDefault, mapField } = field;

      let convertedType: string | undefined = undefined;
      let convertedName: string | undefined = undefined;
      
      if (typeof type === 'object') {
        convertedName = classInfo?.properties.find(x => x.name === name)?.name;
        convertedType = classInfo?.properties.find(x => x.name === name)?.type;
      }
      
      let fieldString: string;
      if(convertedType && convertedName) {
        fieldString = `${convertedName} ${convertedType}`;
      } else {
        fieldString = `${name} ${type}`;
      }   
      
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

    // Collect the depending types
    classInfo?.properties.forEach((property) => {
      if (property.pathDeclaration !== "") {
        console.log(property)
      };
    });


    fs.writeFileSync(schemaPath, updatedContent);
    // remove model if not decorated
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
  const entitiesPath = path.join(PROJECT_ROOT,"demo", "/entities");

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
      generatePrismaModel(entityClass, file);
    } catch (err) {
      console.error(`Error importing ${file}:`, err);
    }
  }
}

function codeFirstGen(): void {
  readAllEntities();
}

export { codeFirstGen, removePrismaModels };
