import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import logger from "@src/shared/logger";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function connectPrisma(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("PostgreSQL connected (Prisma)");
  } catch (err) {
    logger.error("PostgreSQL connection error:", (err as Error).message);
    process.exit(1);
  }
}
