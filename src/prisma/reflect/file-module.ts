import * as ts from 'typescript';

export type FileArray = {
    fileArray: string[]
}

export type FileGlob = {
    fileGlob: string
}

export class FileModule {
    private static instance: FileModule;

    sourceFiles!: string[];
    program!: ts.Program;
    checker!: ts.TypeChecker;

    private constructor() { }

    public static getInstance(): FileModule {

        if (!FileModule.instance) {
            FileModule.instance = new FileModule();
        }

        return FileModule.instance;
    }

    public isTypeLocal(symbol: ts.Symbol) {
        const sourceFile = symbol?.valueDeclaration?.getSourceFile();
        const hasSource = !!sourceFile;
        const isStandardLibrary = hasSource && this.program.isSourceFileDefaultLibrary(sourceFile!)
        const isExternal = hasSource && this.program.isSourceFileFromExternalLibrary(sourceFile!);
        const hasDeclaration = !!symbol?.declarations?.[0];

        return !(isStandardLibrary || isExternal) && hasDeclaration;
    }

    public processProperty(type: ts.Type, node: ts.Node, callback: (propertyName: string, propertyType: string) => void): void {
        for (const property of type.getProperties()) {
            const propertyType = this.checker.getTypeOfSymbolAtLocation(property, node);
            const propertySymbol = propertyType.getSymbol()!;
            const propertyTypeName = this.checker.typeToString(propertyType);

            if (this.isTypeLocal(propertySymbol)) {
                // console.log(`${property.name}: ${propertyTypeName}`)
                
                //this.processProperty(propertyType, node) // avoid deep dive
                callback(property.name, propertyTypeName);
                // this.processProperty(propertyType, node); // evitar aprofundamento desnecessário
            } else {
                callback(property.name, propertyTypeName);
                // console.log(`${sproperty.name}: ${propertyTypeName}`)
            }
        }
    }
}
