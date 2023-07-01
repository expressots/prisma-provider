import chalk from "chalk";

export function printError(message: string, component: string): void {
    console.error(chalk.red(`😞 ${message}:`, chalk.white(`[${component}]`)));
}

export function printReason(reasons: string[]): void {
    console.error(chalk.red(`\nPossible Reasons:`));
    for (let i = 0; i < reasons.length; i++) {
        console.error(chalk.red(`\n${i + 1}-`, chalk.white(`${reasons[i]}`)));
    }
}
