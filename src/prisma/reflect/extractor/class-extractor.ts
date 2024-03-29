import { FileInfo, PropertyInfo } from "../file-info";

export type ClassInfo = {
    name: string;
    properties: Array<PropertyInfo>;
};

export class ClassExtractor {
    public static classes(fileInfo: Array<FileInfo>): Array<ClassInfo> {
        const classes: Array<ClassInfo> = [];
        fileInfo.forEach((file) => {
            file.classes.forEach((cls) => {
                classes.push(cls);
            });
        });
        return classes;
    }

    public static byName(classes: Array<ClassInfo>, className: string): ClassInfo | undefined {
        return classes.find((cls) => cls.name === className);
    }

    public static byPropertyName(
        classes: Array<ClassInfo>,
        propertyName: string,
    ): ClassInfo | undefined {
        return classes.find(
            (cls) => cls.properties.find((prop) => prop.name === propertyName) !== undefined,
        );
    }

    public static byPropertyType(
        classes: Array<ClassInfo>,
        propertyType: string,
    ): Array<ClassInfo> | undefined {
        return classes.filter(
            (cls) => cls.properties.find((prop) => prop.type === propertyType) !== undefined,
        );
    }

    public static print(classes: Array<ClassInfo> | ClassInfo): void {
        if (Array.isArray(classes)) {
            classes.forEach((cls) => {
                this.print(cls);
            });
        } else {
            console.log(`Class: ${classes.name}`);
            classes.properties.forEach((prop) => {
                console.log(`- ${prop.name}: ${prop.type}`);
            });
        }
    }
}
