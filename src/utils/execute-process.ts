import { spawn } from "node:child_process";
import { exit } from "node:process";

async function execProcess({
    commandArg,
    args,
    directory,
}: {
    commandArg: string;
    args: Array<string>;
    directory: string;
}) {
    return new Promise((resolve, reject) => {
        const isWindows: boolean = process.platform === "win32";
        const command: string = isWindows ? `${commandArg}.cmd` : commandArg;

        const installProcess = spawn(command, args, {
            cwd: directory,
        });

        installProcess.stdout.on("data", (data) => {
            console.log(`${data}`);
        });

        installProcess.stderr.on("data", (data) => {
            console.error(`${data}`);
        });

        installProcess.on("close", (code) => {
            if (code === 0) {
                resolve("Process Done!");
            } else {
                reject(new Error(`Command ${command} ${args} exited with code ${code}`));
                exit(1);
            }
        });
    });
}

export { execProcess };
