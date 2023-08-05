import yargs, { CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import { codeFirstGen } from "../prisma/generators/model-generator";

const codegen: CommandModule = {
    command: "codegen",
    describe: "Create schema.prisma from entities",
    handler: async () => {
        await codeFirstGen();
    },
};

yargs(hideBin(process.argv))
    .scriptName("expressots/prisma")
    .command(codegen)
    .help("help", "Show command help")
    .alias("h", "help")
    .version(false)
    .wrap(140)
    .parse();