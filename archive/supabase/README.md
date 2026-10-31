# Historical Supabase migrations

Moved byte-for-byte from `drizzle/migrations` in Phase 2 PR 1, including the journal
and snapshots. Git history and the SQL are retained. This archive is **not** an
input to the independent migrator and must not be applied to plain PostgreSQL.

These files depend on Supabase's auth/storage schemas, JWT identity functions,
RLS roles, and RPC grants. The old cloud database is unchanged. Do not point the
independent migration runner at it or reuse its migration journal.

The active, fresh-database migration chain is `drizzle/migrations`. Existing
application routes still use Supabase until subsequent migration PRs.
