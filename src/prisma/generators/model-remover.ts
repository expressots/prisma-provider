import fs from "fs";
import path from "path";
import glob from "glob";
import { printError } from "../../utils/better-error-message";
import { getDecorators } from "./model-generator";

async function removePrismaModels(files: string[], schemaPath: string): Promise<void> {
    try {
        if (!files.length) {
            console.error("Entity files not found");
            return;
        }

        const schemaContent = fs.readFileSync(schemaPath, "utf-8");
        const modelRegex = /model [^}]* {[^}]*}/g;
        const models = Array.from(schemaContent.matchAll(modelRegex), (m) => m[0]);
        const news: string[] = [];

        for (const file of files) {
            const fileContent = fs.readFileSync(file, "utf-8");
            const classRegex = new RegExp("(?<!\\/\\/.*\\n)class\\s+(\\w+)", "g");
            const classNameMatch = [...fileContent.matchAll(classRegex)];

            for (const match of classNameMatch) {
                const className = match[1];
                try {
                    const module = await import(path.resolve(file));
                    const entityClass = module[className];

                    if (!entityClass) {
                        continue;
                    }

                    const { model } = getDecorators(entityClass);

                    if (model) {
                        const modelString = `model ${entityClass.name}`;
                        news.push(modelString);
                    }
                } catch (err) {
                    printError("Error extracting entity module", `${err}`);
                }
            }
        }

        const inPrisma: string[] = models.map((model) => model.trim());
        const results = inPrisma.filter(
            (item) => !news.some((substring) => item.includes(substring)),
        );
        let updatedContent = schemaContent;
        for (const item of results) {
            updatedContent = updatedContent.replace(item, "");
        }

        fs.writeFileSync(schemaPath, updatedContent);
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function removeModels(
    entitiesPath: string,
    schemaPath: string,
    entityNamePattern: string,
): Promise<void> {
    const files = glob.sync(`${entitiesPath}/**/*.${entityNamePattern}.ts`);
    await removePrismaModels(files, schemaPath);
}

export { removeModels };
