export type ModelsOf<Type> = keyof {
  [Property in keyof Type as Type[Property] extends (...args: any) => any
      ? never
      : Property extends symbol
      ? never
      : Property]: Type[Property];
};
