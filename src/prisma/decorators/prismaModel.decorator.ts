export interface PrismaModelOptions<T = any> {
    map?: string;
    index?: string[];
}

export function PrismaModel<T = any>(options: PrismaModelOptions<T> = {}): ClassDecorator {
  return function (target: Function) {
    if (!Reflect.hasMetadata("prisma:model", target)) {
      Reflect.defineMetadata("prisma:model", [], target);
    }

    const model: PrismaModelOptions = {
      map: options.map,
      // TODO: it remains to see how to Define composite type indexes
      // https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-composite-type-indexes
      index: options.index && options.index.length ? options.index : undefined,
    }

    Reflect.defineMetadata("prisma:model", model, target);
  };
}