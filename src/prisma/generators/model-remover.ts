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
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const tsNode = require("ts-node");
                    // Load TypeScript configuration
                    tsNode.register({
                        transpileOnly: true, // Only transpile, don't type-check
                        compilerOptions: {
                            target: "ESNext", // Target version
                            module: "CommonJS", // Output module format
                        },
                    });

                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const { [className]: EntityClass } = require(path.resolve(file)); // Use the dynamic import

                    if (!EntityClass) {
                        continue;
                    }

                    const { model } = getDecorators(EntityClass);

                    if (model) {
                        const modelString = `model ${EntityClass.name}`;
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
