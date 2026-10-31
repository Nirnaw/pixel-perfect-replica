import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

export const migrationsFolder = fileURLToPath(new URL("../../drizzle/migrations", import.meta.url));
export async function migrateDatabase(url: string) {
  const client = postgres(url, { max: 1, connect_timeout: 10 });
  try {
    await migrate(drizzle(client), { migrationsFolder });
  } finally {
    await client.end();
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const url = process.env["DATABASE_MIGRATION_URL"];
  if (!url) throw new Error("DATABASE_MIGRATION_URL is required; no cloud fallback exists");
  await migrateDatabase(url);
  console.log("Independent migrations applied");
}
