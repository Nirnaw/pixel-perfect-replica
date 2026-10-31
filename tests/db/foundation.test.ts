import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import postgres from "postgres";
import { migrateDatabase } from "../../scripts/db/migrate";
import { seedDatabase } from "../../scripts/db/seed";

// Never use DATABASE_URL or the old cloud bindings. Only disposable local DBs.
test("independent PostgreSQL 17 foundation", async (t) => {
  const configured = process.env["TEST_DATABASE_ADMIN_URL"];
  assert.ok(
    configured,
    "Set TEST_DATABASE_ADMIN_URL to a local PostgreSQL 17 administrative connection",
  );
  const url = new URL(configured);
  assert.ok(
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname),
    "Integration tests require a local database host",
  );
  const name = `clinic_test_${randomBytes(8).toString("hex")}`;
  const admin = postgres(configured, { max: 1, connect_timeout: 10 });
  let client: ReturnType<typeof postgres> | undefined;
  let created = false;
  try {
    const [version] = await admin`show server_version_num`;
    assert.equal(
      Math.floor(Number(version?.["server_version_num"]) / 10000),
      17,
      "Tests require PostgreSQL 17",
    );
    await admin.unsafe(`CREATE DATABASE "${name}"`);
    created = true;
    url.pathname = `/${name}`;
    const connection = url.toString();
    client = postgres(connection, { max: 1, connect_timeout: 10 });
    const db = client;
    await t.test("migrations apply on an empty plain database and can be rerun", async () => {
      await migrateDatabase(connection);
      await migrateDatabase(connection);
      const tables =
        await db`select tablename, rowsecurity from pg_tables where schemaname = 'public'`;
      assert.equal(tables.length, 10);
      assert.ok(tables.every((row) => !row["rowsecurity"]));
      assert.equal(
        (await db`select 1 from pg_namespace where nspname in ('auth','storage')`).length,
        0,
      );
      assert.equal((await db`select * from admin_memberships`).length, 0);
      assert.equal((await db`select * from administration_state`).length, 0);
    });
    const rejects = async (statement: string, code: string) => {
      await assert.rejects(
        db.unsafe(statement),
        (error: unknown) =>
          typeof error === "object" && error !== null && "code" in error && error.code === code,
      );
    };
    await t.test("checks enforce appointment input and defaults", async () => {
      await rejects(
        "insert into appointment_requests(full_name,mobile) values ('A','09123456789')",
        "23514",
      );
      await rejects(
        "insert into appointment_requests(full_name,mobile) values ('Test','123')",
        "23514",
      );
      await rejects(
        "insert into appointment_requests(full_name,mobile,status) values ('Test','09123456789','invalid')",
        "23514",
      );
      await rejects(
        "insert into appointment_requests(full_name,mobile,department) values ('Test','09123456789','invalid')",
        "23514",
      );
      await rejects(
        "insert into appointment_requests(full_name,mobile,notes) values ('Test','09123456789',repeat('x',1001))",
        "23514",
      );
      await rejects(
        "insert into appointment_requests(full_name,mobile,admin_note) values ('Test','09123456789',repeat('x',2001))",
        "23514",
      );
      const [row] =
        await db`insert into appointment_requests(full_name,mobile) values ('Test','09123456789') returning status, notes`;
      assert.equal(row?.["status"], "new");
      assert.equal(row?.["notes"], null);
    });
    await t.test("content constraints, publication rules and null semantics", async () => {
      await rejects("insert into services(slug,title) values ('bad slug','Test')", "23514");
      await rejects("insert into services(slug,title) values ('missing',null)", "23502");
      await rejects(
        "insert into gallery_items(media_url,media_type) values ('/image','other')",
        "23514",
      );
      await rejects(
        "insert into gallery_items(media_url,media_type) values ('/image','before_after')",
        "23514",
      );
      await db`insert into gallery_items(media_url,media_type,published) values ('','before_after',false)`;
      await rejects("insert into site_settings(key,value) values ('clinic','[]')", "23514");
      await rejects(
        `insert into site_settings(key,value) values ('clinic','{"neshan_url":"http://example.com"}')`,
        "23514",
      );
      const [service] =
        await db`insert into services(slug,title) values ('test-service','Test') returning *`;
      assert.equal(service?.["description"], "");
      assert.equal(service?.["image_url"], null);
      await rejects(
        "insert into services(slug,title) values ('test-service','Duplicate')",
        "23505",
      );
    });
    await t.test(
      "foreign key rejects missing services and retains appointments on deletion",
      async () => {
        await rejects(
          "insert into appointment_requests(full_name,mobile,service_id) values ('Test','09123456789','00000000-0000-0000-0000-000000000000')",
          "23503",
        );
        const [row] =
          await db`insert into appointment_requests(full_name,mobile,service_id) select 'Test','09123456789',id from services where slug = 'test-service' returning id`;
        await db`delete from services where slug = 'test-service'`;
        const [retained] =
          await db`select service_id from appointment_requests where id = ${row!["id"]}`;
        assert.equal(retained?.["service_id"], null);
      },
    );
    await t.test("seed imports existing Persian clinic content without accounts", async () => {
      await db`delete from gallery_items`;
      await seedDatabase(connection);
      for (const [table, count] of [
        ["site_settings", 5],
        ["services", 14],
        ["doctors", 2],
        ["gallery_items", 6],
        ["blog_posts", 3],
      ] as const) {
        const [result] = await db.unsafe(`select count(*)::int as count from ${table}`);
        assert.equal(result?.["count"], count, table);
      }
      const [clinic] = await db`select value from site_settings where key='clinic'`;
      assert.equal(clinic?.["value"].name, "مجتمع پزشکی و زیبایی پردیس");
      assert.ok(clinic?.["value"].neshan_url.startsWith("https://"));
      assert.equal((await db`select * from admin_memberships`).length, 0);
    });
    await t.test(
      "reseeding, including concurrent runs, preserves edits and stable IDs",
      async () => {
        await db`update services set slug='owner-edited', title='Owner content', published=false where slug='botox'`;
        await db`update doctors set name='Owner doctor' where sort_order=1`;
        await db`update gallery_items set title='Owner gallery' where sort_order=1`;
        await db`update site_settings set value='{"name":"Owner settings"}' where key='clinic'`;
        const before =
          await db`select id, slug, title, published, revision, updated_at from services order by id`;
        await Promise.all([seedDatabase(connection), seedDatabase(connection)]);
        assert.deepEqual(
          await db`select id, slug, title, published, revision, updated_at from services order by id`,
          before,
        );
        assert.equal((await db`select * from doctors`).length, 2);
        assert.equal((await db`select * from gallery_items`).length, 6);
        assert.equal((await db`select * from doctors where name='Owner doctor'`).length, 1);
        assert.equal((await db`select * from gallery_items where title='Owner gallery'`).length, 1);
        assert.equal(
          (await db`select value from site_settings where key='clinic'`)[0]?.["value"].name,
          "Owner settings",
        );
      },
    );
    await t.test("timestamp/revision triggers and administration singleton", async () => {
      const [before] =
        await db`select revision, updated_at from services where slug='owner-edited'`;
      await db`update services set title='Changed' where slug='owner-edited'`;
      const [after] = await db`select revision, updated_at from services where slug='owner-edited'`;
      assert.equal(after?.["revision"], before?.["revision"] + 1);
      assert.ok(after?.["updated_at"] >= before?.["updated_at"]);
      await rejects("insert into administration_state(singleton) values (false)", "23514");
      await db`insert into administration_state(singleton) values (true)`;
      await rejects("insert into administration_state(singleton) values (true)", "23505");
    });
  } finally {
    if (client) await client.end();
    if (created) await admin.unsafe(`DROP DATABASE "${name}" WITH (FORCE)`);
    await admin.end();
  }
});
