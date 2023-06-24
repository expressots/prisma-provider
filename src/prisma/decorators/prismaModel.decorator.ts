export interface IPrismaModelOptions<T = any> {
    map?: string;
}

export function prismaModel<T = any>(options: IPrismaModelOptions<T> = {}): ClassDecorator {
  return function (target: Function) {
    if (!Reflect.hasMetadata("prisma:model", target)) {
      Reflect.defineMetadata("prisma:model", [], target);
    }

    const model: IPrismaModelOptions = {
      map: options.map
    }

    Reflect.defineMetadata("prisma:model", model, target);
  };
}