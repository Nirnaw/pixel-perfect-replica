import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  // Generation needs no connection. Apply migrations via db:migrate, not push.
  dbCredentials: { url: process.env["DATABASE_MIGRATION_URL"] ?? "" },
});
