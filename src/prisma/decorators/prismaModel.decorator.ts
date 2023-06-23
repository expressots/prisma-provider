export interface PrismaModelOptions<T = any> {
    map?: string;
}

export function PrismaModel<T = any>(options: PrismaModelOptions<T> = {}): ClassDecorator {
  return function (target: Function) {
    if (!Reflect.hasMetadata("prisma:model", target)) {
      Reflect.defineMetadata("prisma:model", [], target);
    }

    const model: PrismaModelOptions = {
      map: options.map,
    }

    Reflect.defineMetadata("prisma:model", model, target);
  };
}