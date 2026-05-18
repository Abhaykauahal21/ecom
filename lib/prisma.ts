import { PrismaClient } from "@prisma/client";

/**
 * Standard Production-Ready Prisma Client Singleton
 * Best optimized for Next.js App Router, Vercel, and Neon serverless environments.
 */

const prismaClientSingleton = () => {
  return new PrismaClient({
    // Standard logging for debugging
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma_v2: PrismaClientSingleton | undefined;
};

// Next.js hot-reload safe singleton pattern
const prisma = globalForPrisma.prisma_v2 ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v2 = prisma;
