export enum IndexType {
    Brin = "Brin",
    Btree = "BTree",
    Gist = "Gist",
    Gin = "Gin",
    Hash = "Hash",
    Spgist = "Spgist",
  }
  
export interface IPrismaIndexOptions<T = any> {
    fields: string[],
    map?: string | undefined,
    name?: string | undefined,
    type?: IndexType | undefined,
}

export function prismaIndex<T = any>(options: IPrismaIndexOptions<T>): ClassDecorator & PropertyDecorator {
  return function (target: Object, propertyKey?: string | symbol) {
    if (propertyKey) {
        const indexOptions = Reflect.getMetadata("prisma:index", target.constructor) as IPrismaIndexOptions[] || [];
        const indexOption: IPrismaIndexOptions = {
            fields: options.fields,
            map: options.map,
            name: options.name,
            type: options.type,
        };
        indexOptions.push(indexOption);
        Reflect.defineMetadata("prisma:index", indexOptions, target.constructor);
    }  else {

        if (!Reflect.hasMetadata("prisma:index", target)) {
        Reflect.defineMetadata("prisma:index", [], target.constructor);
        }
   
        const indexOptions = Reflect.getMetadata("prisma:index", target) as IPrismaIndexOptions[] || [];
        const indexOption: IPrismaIndexOptions = {
        fields: options.fields,
        map: options.map,
        name: options.name,
        type: options.type,
        };

        indexOptions.push(indexOption);
        Reflect.defineMetadata("prisma:index", indexOptions, target);
    }
  };
}