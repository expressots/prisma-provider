/**
 * Enum that specifies the various kinds of relations that Prisma supports.
 */
export enum Relation {
    OneToOne = "OneToOne",
    OneToMany = "OneToMany",
    ManyToOne = "ManyToOne",
    ManyToMany = "ManyToMany",
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
     */
    name?: string;

    /**
     * Relation type.
     */
    relation: Relation;

    /**
     * Related entity.
     */
    model: object;

    /**
     * List of primary keys in the relation.
     */
    PK: string[];

    /**
     * List of foreign keys names given in the relation.
     */
    FK?: string[];

    /**
     * Behavior on delete.
     */
    onDelete?: Action;

    /**
     * Behavior on update.
     */
    onUpdate?: Action;

    /**
     * Optional name for the relation.
     */
    map?: string;
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
            PK: options.PK,
            FK: options.FK || undefined,
            onDelete: options.onDelete || undefined,
            onUpdate: options.onUpdate || undefined,
            map: options.map || undefined,
        };

        relations.push(relation);
        Reflect.defineMetadata("prisma:relations", relations, target.constructor);
    };
}
