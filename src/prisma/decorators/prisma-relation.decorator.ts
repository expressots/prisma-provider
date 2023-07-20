/**
 * Enum that specifies the various kinds of relations that Prisma supports.
 */
export enum Relation {
    OneToOne = "OneToOne",
    OneToMany = "OneToMany",
    ManyToMany = "ManyToMany",
    ManyToManyExplicit = "ManyToManyExplicit",
}

/**
 * Enum that specifies the different actions that Prisma can take on related data.
 */
export enum Action {
    Cascade = "Cascade",
    SetNull = "SetNull",
    Restrict = "Restrict",
    NoAction = "NoAction",
    SetDefault = "SetDefault",
}

/**
 * Interface for defining options for Prisma relation.
 */
export interface IPrismaRelationOptions {
    /**
     * Optional name for the relation.
     * @default undefined
     * @remarks
     * This option is only applicable for OneToOne and OneToMany relations.
     */
    name?: string;

    /**
     * Relation type.
     */
    relation: Relation;

    /**
     * Related entity.
     */
    model: string; // TODO: Change type to object.

    /**
     * List of primary keys in the relation.
     *
     * This option is required for relation types OneToOne, OneToMany,
     * and ManyToManyExplicit, but it will be ignored for the ManyToMany type if passed.
     */
    refs?: string[] | undefined;

    /**
     * List of foreign keys names given in the relation.
     */
    fields?: string[];

    /**
     * Behavior on delete.
     */
    onDelete?: Action;

    /**
     * Behavior on update.
     */
    onUpdate?: Action;

    /**
     * Specifies if the relation is optional.
     * @default true
     * @remarks
     * This option is only applicable for OneToOne and OneToMany relations.
     */
    isRequired?: boolean;
}

/**
 * Function to define a Prisma relation decorator.
 * @param {IPrismaRelationOptions} options - Options for the Prisma relation.
 */
export function prismaRelation(options: IPrismaRelationOptions): PropertyDecorator {
    return function (target: object) {
        if (!Reflect.hasMetadata("prisma:relations", target.constructor)) {
            Reflect.defineMetadata("prisma:relations", [], target.constructor);
        }

        const relations = Reflect.getMetadata(
            "prisma:relations",
            target.constructor,
        ) as IPrismaRelationOptions[];
        const relation: IPrismaRelationOptions = {
            name: options.name || undefined,
            relation: options.relation,
            model: options.model,
            refs: options.refs || undefined,
            fields: options.fields || undefined,
            onDelete: options.onDelete || undefined,
            onUpdate: options.onUpdate || undefined,
            isRequired: options.isRequired || false,
        };

        relations.push(relation);
        Reflect.defineMetadata("prisma:relations", relations, target.constructor);
    };
}
