import fs from "fs";
import glob from "glob";
import path from "path";
import { IPrismaFieldOptions, IPrismaModelOptions } from "../decorators";
import { IPrismaIndexOptions } from "../decorators/index.decorator";
import { reflect } from "../reflect/reflect";
import { FileInfo } from "../reflect/file-info";
import { ClassExtractor } from "../reflect/extractor/class-extractor";
import typeSearcher from "../../utils/typeSearcher";
import removeUnusedEnumsAndTypes from "../../utils/removeUnusedEnumsAndTypes";
import { execProcess } from "../../utils/execProcess";

const PROJECT_ROOT = path.join(__dirname, "..", "..", "..", "src");

async function generatePrismaModel(cls: any, filePath: string, schemaPath: string): Promise<void> {
  const reflectInfo: FileInfo[] = reflect({ fileArray: [filePath] });
  const model = (Reflect.getMetadata("prisma:model", cls) as IPrismaModelOptions) || false;
  const indexOptions = (Reflect.getMetadata("prisma:index", cls) as IPrismaIndexOptions[]) || [];

  if (model) {
    const className = cls.name;
    const fields = (Reflect.getMetadata("prisma:fields", cls) as IPrismaFieldOptions[]) || [];
    const classInfo = ClassExtractor.byName(ClassExtractor.classes(reflectInfo), className);

    const idFields: string[] = [];
    const uniqueFields: string[] = [];

    const fieldStrings = fields.map((field) => {
      const { name, type, attr, isId, isOptional, isUnique, prismaDefault, mapField } = field;

      let convertedType: string | undefined = undefined;
      let convertedName: string | undefined = undefined;

      if (typeof type === 'object') {
        convertedName = classInfo?.properties.find(x => x.name === name)?.name;
        convertedType = classInfo?.properties.find(x => x.name === name)?.type;
      }

      let fieldString: string;
      if (convertedType && convertedName) {
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

    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    const modelRegex = new RegExp(`(model ${className} {[^}]*})`, "g");
    const modelExists = modelRegex.test(schemaContent);

    let updatedContent;
    if (modelExists) {
      // Update the existing model
      updatedContent = schemaContent.replace(modelRegex, modelString);
    } else {
      // REVIEW: See if we are going to use the [Model] or not
      // Add the new model after the [Models] comment
      // updatedContent = schemaContent.replace("// [Models]", `// [Models]\n\n${modelString}`);
      updatedContent = `${schemaContent}\n\n${modelString}`;
    }

    // Join the idFields with comma separation and add them as a new fieldString if there's more than one id field
    if (idFields.length > 1) {
      const idFieldsString = `@@id([${idFields.join(", ")}])`;
      const modelRegex = new RegExp(`(model ${className} {[^}]*)`, "g");
      updatedContent = updatedContent.replace(modelRegex, `$1\n  ${idFieldsString}\n`);
    } else if (idFields.length === 1) {
      // BUG: when we have two classes with the same field name, it will add the @id annotation to both
      const regexPattern = `model\\s+${className}\\s+{[^}]*?${idFields[0]}\\s+\\w+[^}]*}`;
      const regex = new RegExp(regexPattern);
      // Realizar o replace do valor do campo
      updatedContent = updatedContent.replace(regex, (match) => {
        return match.replace(new RegExp(`(${idFields[0]} [A-Za-z]*)`), `$1 @id`)
      });

      // updatedContent = updatedContent.replace(
      // new RegExp(`(${idFields[0]} [A-Za-z]*)`),
      // `$1 @id`
      // )
    }

    // Join the uniqueFields with comma separation and add them as a new fieldString if there's more than one unique field
    if (uniqueFields.length > 1) {
      const uniqueFieldsString = `@@unique([${uniqueFields.join(", ")}])`;
      const modelRegex = new RegExp(`(model ${className} {[^}]*)`, "g");
      updatedContent = updatedContent.replace(modelRegex, `$1\n  ${uniqueFieldsString}\n`);
    } else if (uniqueFields.length === 1) {
      // BUG: when we have two classes with the same field name, it will add the @unique annotation to both
      const regexPattern = `model\\s+${className}\\s+{[^}]*?${idFields[0]}\\s+\\w+[^}]*}`;
      const regex = new RegExp(regexPattern);
      // Realizar o replace do valor do campo
      updatedContent = updatedContent.replace(regex, (match) => {
        return match.replace(new RegExp(`(${uniqueFields[0]} [A-Za-z]*)`), `$1 @unique`)
      });

      // updatedContent = updatedContent.replace(
      // new RegExp(`(${uniqueFields[0]} [A-Za-z]*)`),
      // `$1 @unique`
      // )
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
      if (property.pathDeclaration && property.pathDeclaration !== "") {
        const type = property.type.replace(/[\[\]?!]/g, '');
        const value = typeSearcher(type, property.pathDeclaration);
        if (value) {
          if (value?.includes("enum")) {
            const enumRegex = new RegExp(value, "g");
            const enumExists = enumRegex.test(schemaContent);
            if (enumExists) {
              updatedContent = updatedContent.replace(enumRegex, value);
            } else {
              // REVIEW: See if we are going to use the [Enums] or not
              // updatedContent = updatedContent.replace("// [Enums]", `// [Enums]\n\n${value}`);
              updatedContent = `${updatedContent}\n\n${value}`;
            }
          } else {
            const typeRegex = new RegExp(value, "g");
            const typeExists = typeRegex.test(schemaContent);
            if (typeExists) {
              updatedContent = updatedContent.replace(typeRegex, value);
            } else {
              // REVIEW: See if we are going to use the [Types] or not
              // updatedContent = updatedContent.replace("// [Types]", `// [Types]\n\n${value}`);
              updatedContent = `${updatedContent}\n\n${value}`;
            }
          }
        }
      };
    });

    fs.writeFileSync(schemaPath, updatedContent);
    // remove model if not decorated
  } else {
    const className = cls.name;
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

async function readAllEntities(entitiesPath: string, schemaPath: string): Promise<void> {
  // TODO: add in docs that we need to add .entity.ts to the end of the file name 
  const files = glob.sync(`${entitiesPath}/**/*.entity.ts`);
  if (!files) {
    console.error("Error reading entity files");
    return;
  }

  for (const file of files) {
    // TODO: check when file have two classes
    const fileContent = fs.readFileSync(file, "utf-8");
    const regex = new RegExp('class\\s+(\\w+)', 'g');
    const classNameMatch = [...fileContent.matchAll(regex)];

    if (!classNameMatch) {
      console.error(`Could not find classes declaration in ${file}`);
      continue;
    }

    for (const match of classNameMatch) {
      const className = match[1];
      
      try {
        const module = await import(path.resolve(file));
        const entityClass = module.default || module[className];
        await generatePrismaModel(entityClass, file, schemaPath);
      } catch (err) {
        console.error(`Error importing ${file}:`, err);
      }
    }
  }
}

async function codeFirstGen(): Promise<void> {
  // TODO: We need to get the schema path and entities path from the config file and check the PROJECT_ROOT
  const schemaPath = path.join(PROJECT_ROOT, "demo/orm/prisma", "/schema.prisma");
  const entitiesPath = path.join(PROJECT_ROOT, "demo", "/entities");
  await readAllEntities(entitiesPath, schemaPath);
  await removeUnusedEnumsAndTypes(schemaPath);

  // Execute prisma validate
  await execProcess({ commandArg: "npx", args: ["prisma", "validate"], directory: PROJECT_ROOT })
  // Execute prisma format
  await execProcess({ commandArg: "npx", args: ["prisma", "format"], directory: PROJECT_ROOT })
}

export { codeFirstGen };
