export enum IndexType {
    Brin = "Brin",
    Btree = "Btree",
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

export function prismaIndex<T = any>(options: IPrismaIndexOptions<T>): ClassDecorator {
  return function (target: Function) {
    if (!Reflect.hasMetadata("prisma:index", target)) {
      Reflect.defineMetadata("prisma:index", [], target.constructor);
    }
    
    const indexes = Reflect.getMetadata("prisma:index", target.constructor) as IPrismaIndexOptions[];
    const indexOption: IPrismaIndexOptions = {
        fields: options.fields,
        map: options.map || undefined,
        name: options.name || undefined,
        type: options.type || undefined,
    }

    indexes.push(indexOption);
    Reflect.defineMetadata("prisma:index", indexes, target.constructor);
  };
}