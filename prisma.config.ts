import { config } from "dotenv";
// Next.js reads .env.local automatically at runtime; the Prisma CLI does not,
// so load it explicitly here (falls back to .env if present).
config({ path: ".env.local" });
config();

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Prisma CLI commands (migrate, seed) run against the direct (unpooled)
    // connection; the app itself uses DATABASE_URL (pooled) via src/lib/prisma.ts.
    url: env("DATABASE_URL_UNPOOLED"),
  },
});
