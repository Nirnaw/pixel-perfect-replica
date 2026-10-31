import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import postgres from "postgres";
import { getTableColumns } from "drizzle-orm";
import { siteSettings, services, doctors, galleryItems, blogPosts } from "../../drizzle/schema";

const sources = [
  { name: "site_settings", table: siteSettings, key: "key" },
  { name: "services", table: services, key: "slug" },
  { name: "doctors", table: doctors, key: "name" },
  { name: "gallery_items", table: galleryItems, key: "title" },
  { name: "blog_posts", table: blogPosts, key: "slug" },
];
export async function seedDatabase(url: string) {
  const client = postgres(url, { max: 1, connect_timeout: 10 });
  try {
    const seed = await readFile(new URL("../../drizzle/seeds/clinic.sql", import.meta.url), "utf8");
    await client.begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(726411)`;
      for (const { name } of sources) {
        await tx.unsafe(
          `CREATE TEMP TABLE seed_${name} (LIKE public.${name} INCLUDING DEFAULTS) ON COMMIT DROP`,
        );
      }
      await tx.unsafe(seed);
      for (const { name, table, key } of sources) {
        const columns = Object.keys(getTableColumns(table)).filter((c) => c !== "id");
        const list = columns.map((c) => `"${c}"`).join(", ");
        // Stable IDs survive edits to names/slugs. Never update an existing row.
        await tx.unsafe(`INSERT INTO public.${name} (id, ${list})
          SELECT md5('clinic-seed-v1:${name}:' || "${key}")::uuid, ${list}
          FROM seed_${name} ON CONFLICT DO NOTHING`);
      }
    });
  } finally {
    await client.end();
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const url = process.env["DATABASE_MIGRATION_URL"];
  if (!url) throw new Error("DATABASE_MIGRATION_URL is required; no cloud fallback exists");
  await seedDatabase(url);
  console.log("Missing clinic seed records inserted; existing records preserved");
}
