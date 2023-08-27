import { existsSync } from "node:fs";
import path from "path";
import { RegisterOptions, Service } from "ts-node";
import { ExpressoConfig } from "../@types";

/**
 * The path to the expressots.config.ts file
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EXPRESSOTS_CONFIG: string = path.join(process.cwd(), "expressots.config.ts");

/**
 * The config object
 */
let globalConfigObject: any = null;

/**
 * The ts-node register options
 */
const regOpt: RegisterOptions = {
    compilerOptions: {
        module: "commonjs",
    },
    moduleTypes: {
        "**": "cjs",
    },
};

/**
 * Singleton compiler class
 */
class Compiler {
    private static instance: Compiler;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    static get Instance(): Compiler {
        if (!Compiler.instance) {
            Compiler.instance = new Compiler();
        }
        return Compiler.instance;
    }

    async getService(): Promise<Service> {
        const tsnode = await import("ts-node");
        const compiler: Service = tsnode.register(regOpt);
        return compiler;
    }

    private static interopRequireDefault(obj: any): { default: any } {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const module = require(obj);
        return module && module.__esModule ? module : { default: module };
    }

    private static async findConfig(dir: string): Promise<string> {
        const exists = existsSync(dir);

        if (exists) return dir;

        const parentDir = path.join(dir, "..");

        if (parentDir === dir) {
            console.error("No config file found!", "expressots.config.ts");
            process.exit(1);
        }

        return Compiler.findConfig(parentDir);
    }

    static async loadConfig(
        filePath: string = path.join(process.cwd(), "expressots.config.ts"),
    ): Promise<ExpressoConfig> {
        const compiler: Service = await Compiler.Instance.getService();

        compiler.enabled(true);

        globalConfigObject = Compiler.interopRequireDefault(await Compiler.findConfig(filePath));

        compiler.enabled(false);

        return globalConfigObject.default;
    }
}

export default Compiler;
