import "reflect-metadata";
import { ScalarType } from "./prisma/types/scalar-types";
import { generatePrismaModels } from "./prisma/generator";


generatePrismaModels();