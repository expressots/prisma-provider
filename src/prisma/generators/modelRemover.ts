import fs from "fs";
import glob from "glob";
import path from "path";

const PROJECT_ROOT = path.join(__dirname, "..", "..", "..", "src");

async function removePrismaModels(entitiesPath: string, schemaPath: string): Promise<void> {
  try {
    const files = glob.sync(`${entitiesPath}/**/*.entity.ts`);
    if (!files.length) {
      console.error('Error reading entity files');
      return;
    }

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

async function removeModels(): Promise<void> {
  const schemaPath = path.join(PROJECT_ROOT, "demo/orm/prisma", "/schema.prisma");
  const entitiesPath = path.join(PROJECT_ROOT, "demo", "/entities");
  removePrismaModels(entitiesPath, schemaPath);
}

export { removeModels };