# Independent PostgreSQL foundation

This is an opt-in foundation, based on Phase 1 `f8ff03e`. No route, browser client,
Supabase integration, authentication flow, or existing cloud database is switched.
Do not apply the independent migration chain to a Supabase database or an existing
production database. Start with a new, empty PostgreSQL 17 database.

## Local setup

Use Node 24.19.0, Bun 1.3.14, and Docker with Compose v2. Install the frozen lockfile:

```sh
bun install --frozen-lockfile
# Fresh checkouts only. Never replace an existing .env:
cp -n .env.example .env
```

Generate your own local password, for example with `openssl rand -hex 24`. Set
`POSTGRES_PASSWORD` in the ignored `.env` without committing it. Then configure:

- `DATABASE_MIGRATION_URL`: `postgresql://clinic:<encoded-password>@127.0.0.1:5432/clinic`
- `DATABASE_URL`: same local URL during development.
- `TEST_DATABASE_ADMIN_URL`: `postgresql://clinic:<encoded-password>@127.0.0.1:5432/postgres`

Replace placeholders locally; percent-encode URL password characters. If using
`POSTGRES_PORT`, update connection URLs to match. These are server-only variables;
never prefix them with `VITE_`. Existing Supabase values should be preserved.

```sh
docker compose up -d --wait
npm run db:migrate
npm run db:seed
npm run test:db
```

Compose binds only to loopback, pins a PostgreSQL 17 image digest, uses a named
volume, and checks `pg_isready`. The `clinic` role is a local development superuser
created by the official image; it is **not** a production application role. Image
patch/digest upgrades should be reviewed and tested. Changing the password in
`.env` does not change credentials in an already initialized volume.

`docker compose down` retains data. `docker compose down -v` irreversibly deletes
this project's local volume; do not use it on a database you need to keep. This
service does not deploy the application, run migrations automatically, or contact
Lovable Cloud. Volumes are not backups.

## Schema and migration maintenance

`drizzle/schema.ts` is the source of truth for content, settings, gallery,
appointments, and application-owned administration metadata. `db:generate` writes
reviewable SQL plus Drizzle snapshots. The custom timestamp migration installs
triggers for all SQL update paths; content revisions increment at the database
layer. Keep custom trigger changes in new versioned SQL migrations.

```sh
npm run db:generate -- --name describe_change
npm run typecheck
npm run test:db
```

Never edit an applied migration or use schema `push` in production. Migrations use
`DATABASE_MIGRATION_URL` only; the empty/absent variable fails rather than falling
back to any Supabase/Lovable binding. The Drizzle journal is separate from the
archived journal. Run one migration job at a time before application rollout.

The server-only connection factory is `src/server/db/client.server.ts`. It opens
connections lazily, uses a bounded pool, exposes explicit cleanup, and has no
application consumers yet. Import it only from server code. Connections respect
postgres-js URL TLS configuration; use verified TLS for remote database traffic.
Do not put connection strings in logs or client bundles.

For production, provision a separate migration owner and a restricted runtime role:
no superuser, CREATEDB, DDL, or migration-journal writes for the runtime role. Grant
only required table/sequence/schema privileges. The local test user needs CREATEDB
because integration tests provision uniquely named databases and clean them up.
No public database port or browser database access is part of the target design.

## Preserved behavior and intentional deferrals

All existing content fields remain available, including nullable image/SEO fields,
empty text defaults, draft/publication state, sort order, optional map links,
Markdown, blog dates, and before/after pairs. New checks constrain names, slugs,
departments, appointment statuses/lengths and published before/after pairs. URL
checks are basic database safeguards; future endpoints still need full Zod/URL
validation and authorization. Public/draft isolation is not supplied by RLS here:
future public repositories must explicitly filter published data.

`admin_memberships` is application-owned membership metadata using an opaque text
user ID. `administration_state` reserves one bootstrap-state row, and
`audit_events` reserves redacted action metadata. **There are no credential,
account, session, or reset-token tables, and no admin is created.** The Better Auth
PR must generate its actual schema for the selected version, add user foreign keys
(with deliberate deletion semantics), implement atomic bootstrap and self/last-admin
protection, authorize every operation, and test concurrent revocations **before
using these tables**. Current Supabase admin behavior remains unchanged.

Appointment abuse throttling, duplicate checks, and auth-dependent protections
are not copied as misleading partial Supabase triggers. The future endpoint PR
must implement shared, concurrency-safe controls before exposing inserts. This
foundation exposes no new HTTP endpoint. Media storage, MFA, mail, audit writers,
and retention jobs remain future work.

## Seeds

`drizzle/seeds/clinic.sql` contains the existing Lovable-generated Persian settings,
14 services, two doctors, six gallery entries and three articles, with map links
from the archived follow-up migration. Products, appointments and accounts start
empty. Referenced `/images/...` seed assets remain in `public`.

The seed runner stages source records in temporary tables within a transaction,
uses deterministic UUIDs derived from fixed seed identities, then inserts with
`ON CONFLICT DO NOTHING`. Existing rows (including edited names/slugs/settings,
publication state and timestamps) are never updated. A transaction advisory lock
serializes concurrent seed runs. A failing seed rolls back completely.

Reseeding restores missing baseline records, including intentionally deleted seed
records. It is an explicit operator action, not an application startup step.
Do not rename source seed identities to update content; use an explicit reviewed
content migration if needed. New records conflicting with existing unique keys
are intentionally skipped. No production data export, account/password, signed
URL, or cloud credential is included. Review medical text, contact details, map
destinations and asset rights before publishing the site.

## Integration tests

`npm run test:db` is separate from the existing browser-oriented Vitest suite.
It fails with an actionable message if `TEST_DATABASE_ADMIN_URL` is missing,
non-local, or does not point to PostgreSQL 17; it never silently skips or falls back
to `DATABASE_URL`. The local-only restriction is intentional safety for this PR.

Each run creates a random `clinic_test_*` database, runs the real migration files,
exercises constraints, FK behavior, triggers, seed counts and repeated/concurrent
seeding after owner edits, then drops only its own database in a `finally` block.
An interrupted process can leave a uniquely named test database; inspect and remove
only verified test leftovers. Tests do not reset the configured application DB.
