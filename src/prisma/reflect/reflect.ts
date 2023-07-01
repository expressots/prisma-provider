import * as ts from "typescript";
import { glob } from "glob";
import { FileArray, FileGlob, FileModule } from "./file-module";
import { processFile } from "./process-file";
import { FileInfo } from "./file-info";

export function reflect(files: FileArray | FileGlob): FileInfo[] {
    let filesToParse: string | string[] = [];

    if ("fileArray" in files) {
        filesToParse = files.fileArray as string[];
    } else if ("fileGlob" in files) {
        filesToParse = glob.sync(files.fileGlob);
    }
    const fileModule: FileModule = FileModule.getInstance();
    fileModule.sourceFiles = filesToParse;
    fileModule.program = ts.createProgram(filesToParse, {});
    fileModule.checker = fileModule.program.getTypeChecker();

    return processFile(fileModule);
}
