import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    accelerateUrl: process.env.PRISMA_ACCELERATE_URL ?? 'https://accelerate.invalid',
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
