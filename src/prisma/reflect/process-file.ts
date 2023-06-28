import * as ts from 'typescript';
import { FileModule } from './file-module';

interface PropertyInfo {
  name: string;
  type: string;
}

export type FileInfo = {
  file: string;
  imports: string[];
  exports: string[];
  enums: { name: string; values: { [key: string]: number } }[];
  types: { name: string; properties: PropertyInfo[] }[];
  classes: { name: string; properties: PropertyInfo[] }[];
}

export function processFile(fileModule: FileModule): FileInfo[] {

  const filesParsed: string[] = fileModule.sourceFiles;
  const program: ts.Program = ts.createProgram(filesParsed, {});
  const checker: ts.TypeChecker = program.getTypeChecker();
  const fileInfoArray: FileInfo[] = [];

  filesParsed.forEach(file => {
    const fileInfo: FileInfo = {
      file: file,
      imports: [],
      exports: [],
      enums: [],
      types: [],
      classes: []
    };

    // console.log(`File: ${file}`)
    const sourceFile = program.getSourceFile(file);

    if (sourceFile) {
      ts.forEachChild(sourceFile, node => {

        if (ts.isSourceFile(node)) {
          // console.log(`File name: ${node.fileName}`);
          // console.log("\n");
          fileInfo.file = node.fileName;
        }

        // get all imports paths
        if (ts.isImportDeclaration(node)) {
          const importPath = node.moduleSpecifier.getText(sourceFile);
          // console.log(`Import: ${importPath}`);
          fileInfo.imports?.push(importPath);
        }
        // console.log('-------------------');
        // get all exports
        if (ts.isExportDeclaration(node)) {
          const exportPath = node.moduleSpecifier?.getText(sourceFile);
          const exportName = node.exportClause?.getText(sourceFile);
          // console.log(`Export: ${exportPath || exportName}`);
          fileInfo.exports?.push(`${exportPath || exportName}`);
        }

        if (ts.isEnumDeclaration(node)) {
          const enumObject = checker.getTypeAtLocation(node.name!);
          // console.log(`Enum: '${checker.typeToString(enumObject)}'`);
          const enumName = checker.typeToString(enumObject);

          const enumMembers: { [key: string]: number } = {};
          node.members.forEach(member => {
            const memberName = member.name.getText(sourceFile);
            const memberValue = checker.getConstantValue(member) as number;
            // console.log(`${memberName}: ${memberValue}`);
            enumMembers[memberName] = memberValue;
          });
          // console.log('-------------------');
          const enumObjectInstance = Object.freeze(enumMembers);
          fileInfo.enums.push({ name: enumName, values: enumObjectInstance });
        }

        if (ts.isTypeAliasDeclaration(node)) {
          const typeObject = checker.getTypeAtLocation(node.name!);
          const typeName = checker.typeToString(typeObject);
          // console.log(`Type: '${checker.typeToString(typeObject)}'`);
          const typeProperties: PropertyInfo[] = [];
          fileModule.processProperty(typeObject, node, (propertyName: string, propertyType: string) => {
            typeProperties.push({ name: propertyName, type: propertyType });
          });

          fileInfo.types.push({ name: typeName, properties: typeProperties });
          // console.log('-------------------');
        }

        if (ts.isClassDeclaration(node)) {
          const classObject = checker.getTypeAtLocation(node.name!);
          // console.log(`Class: '${checker.typeToString(classObject)}'`);
          const className = checker.typeToString(classObject);
          const classProperties: PropertyInfo[] = [];
          fileModule.processProperty(classObject, node, (propertyName: string, propertyType: string) => {
            classProperties.push({ name: propertyName, type: propertyType });
          });

          fileInfo.classes.push({ name: className, properties: classProperties });
          // console.log('-------------------');
        }

      });
      fileInfoArray.push(fileInfo);
    } else {
      console.error('File not found')
    }
  });
  return fileInfoArray;
}