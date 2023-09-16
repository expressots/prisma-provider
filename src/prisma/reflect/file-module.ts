import * as ts from "typescript";
import * as path from "path";

export type FileArray = {
    fileArray: string[];
};

export type FileGlob = {
    fileGlob: string;
};

export class FileModule {
    private static instance: FileModule;

    sourceFiles!: string[];
    program!: ts.Program;
    checker!: ts.TypeChecker;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    public static getInstance(): FileModule {
        if (!FileModule.instance) {
            FileModule.instance = new FileModule();
        }

        return FileModule.instance;
    }

    public isTypeLocal(symbol: ts.Symbol) {
        const sourceFile = symbol?.valueDeclaration?.getSourceFile();
        const hasSource = !!sourceFile;
        const isStandardLibrary = hasSource && this.program.isSourceFileDefaultLibrary(sourceFile!);
        const isExternal = hasSource && this.program.isSourceFileFromExternalLibrary(sourceFile!);
        const hasDeclaration = !!symbol?.declarations?.[0];

        return !(isStandardLibrary || isExternal) && hasDeclaration;
    }

    public processProperty(
        type: ts.Type,
        node: ts.Node,
        sourceFile: ts.SourceFile,
        callback: (propertyName: string, propertyType: string, pathDeclaration: string) => void,
    ): void {
        let pathDeclaration = "";

        for (const property of type.getProperties()) {
            const propertyType = this.checker.getTypeOfSymbolAtLocation(property, node);
            const propertySymbol = propertyType.getSymbol()!;
            const propertyTypeName = this.checker.typeToString(propertyType);

            if (this.checker.isArrayType(propertyType)) {
                const elementType = (propertyType as ts.TypeReference).typeArguments?.[0];

                if (elementType) {
                    const elementTypeSymbol = elementType.getSymbol()!;
                    const elementDeclaration = elementTypeSymbol?.getDeclarations();

                    if (elementDeclaration && elementDeclaration.length > 0) {
                        const declaration = elementDeclaration[0];
                        const sourceFileDirname = path.dirname(sourceFile.fileName);
                        const filePath = path.resolve(
                            sourceFileDirname,
                            declaration.getSourceFile().fileName,
                        );

                        pathDeclaration = `${filePath}`;
                    }
                }
            } else {
                const declarations = propertySymbol?.getDeclarations();

                if (declarations && declarations.length > 0) {
                    const declaration = declarations[0];
                    const sourceFileDirname = path.dirname(sourceFile.fileName);
                    const filePath = path.resolve(
                        //sourceFileDirname,
                        declaration.getSourceFile().fileName,
                    );

                    pathDeclaration = `${filePath}`;
                }
            }

            if (this.isTypeLocal(propertySymbol)) {
                callback(property.name, propertyTypeName, pathDeclaration);
            } else {
                callback(property.name, propertyTypeName, pathDeclaration);
            }
        }
    }
}
