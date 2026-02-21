import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in your .env file");
}


const adapter = new PrismaMariaDb(connectionString);

const prisma = new PrismaClient({ adapter });

export default prisma;