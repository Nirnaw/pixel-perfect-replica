import "@tanstack/react-start/server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../../../drizzle/schema";

// Deliberately not imported by existing routes. No Supabase fallback.
export function connectDatabase(url = process.env["DATABASE_URL"]) {
  if (typeof window !== "undefined") throw new Error("Database access is server-only");
  if (!url) throw new Error("DATABASE_URL is required for independent database access");
  const client = postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 10 });
  return { db: drizzle(client, { schema }), close: () => client.end() };
}
