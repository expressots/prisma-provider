import "reflect-metadata";
import { generatePrismaModels, removePrismaModels } from "./prisma/generator";


import { PrismaClient } from '@prisma/client'
import User from "./demo/entities/user.entity";
import { ScalarTypeAttributesMap, StringAttributesPostgres } from "./prisma/types/native-type-attributes/postgres-attr";
import { ScalarType } from "./prisma/types/scalar-types";

// const prisma = new PrismaClient()

// async function main() {
//   const user: User = new User('Juliano', 27);

//   const userPrismaCreate: User = await prisma.user.create({
//     data: user,
//   });

//   // const userPrismaUpdate: User = await prisma.user.update({}) 

//   console.log(userPrismaCreate);
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })

//generatePrismaModels();
//removePrismaModels();

const attribute = ScalarTypeAttributesMap(ScalarType.String, StringAttributesPostgres.Xml);
console.log(attribute.toString());