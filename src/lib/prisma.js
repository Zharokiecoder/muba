import { PrismaClient } from "@prisma/client";

let prisma;

// Avoid multiple instances in dev (Hot Reloading issue)
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL }, // use pooled for prod
    },
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      datasources: {
        db: {
          // Prefer DIRECT_URL for local dev (avoids Neon pooler timeouts)
          url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
      },
    });
  }
  prisma = global.prisma;
}

export default prisma;
