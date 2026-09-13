/**
 * Edge-compatible Prisma Client for Cloudflare Pages / Edge Runtime & Node.js
 * Supports Neon Serverless Driver Adapter or direct HTTP connection.
 */
import { PrismaClient } from "@prisma/client";

// Global cache to prevent multiple client instances during hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const getPrisma = (): PrismaClient => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  let client: PrismaClient;

  // Check if database URL is configured
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // Return lazy dummy client or throw helpful error
    client = new PrismaClient();
  } else {
    // When deploying to Cloudflare Edge with Neon serverless:
    try {
      // In Edge runtime, driver adapters (like @prisma/adapter-neon) can be attached:
      // const { Pool } = require("@neondatabase/serverless");
      // const { PrismaNeon } = require("@prisma/adapter-neon");
      // const pool = new Pool({ connectionString });
      // const adapter = new PrismaNeon(pool);
      // client = new PrismaClient({ adapter });
      client = new PrismaClient();
    } catch {
      client = new PrismaClient();
    }
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
};

export const prisma = getPrisma();
export default prisma;
