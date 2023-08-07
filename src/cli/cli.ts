#!/usr/bin/env node

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
    .demandCommand(1, "You need at least one command before moving on")
    .epilog(
        "For more information: \n" +
            "🌐 visit:\t https://expresso-ts.com\n" +
            "💖 Sponsor:\t https://github.com/sponsors/expressots",
    )
    .help("help", "Show command help")
    .alias("h", "help")
    .version(false)
    .wrap(140)
    .parse();
