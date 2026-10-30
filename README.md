# Pixel-Perfect Replica

Persian RTL medical aesthetics clinic website built with React, TanStack Start,
TanStack Router, Tailwind CSS, and Nitro. Development and production builds use
standard Vite plugins and do not require Lovable's editor or build wrapper.

The existing Supabase data, authentication, and storage integration is retained.
This phase does not replace that backend with standalone PostgreSQL.

## Requirements

- Node.js **24.19.0**, the tested version (pinned in `.nvmrc`).
- Bun **1.3.14** for reproducible dependency installation with `bun.lock`.
- A reachable existing Supabase-compatible backend for database-backed pages.

## Install and develop

```sh
nvm install
nvm use
bun install --frozen-lockfile
# On a fresh checkout only; preserve any existing .env and its values:
cp -n .env.example .env
# Fill in the backend URL and publishable keys in .env before running.
npm run dev -- --host 0.0.0.0 --port 3000
```

`.env` and environment-specific variants are ignored by Git. `.env.example`
documents the settings without credentials. Do not commit privileged credentials.
Removing `.env` from current tracking does not remove it from existing Git history.

## Build and run on Node.js

```sh
npm run build
npm start
```

The build produces `.output/server/index.mjs` and `.output/public` using Nitro's
`node-server` preset. Retain the **entire `.output` directory** when packaging the
application. `npm start` uses Node's `--env-file-if-exists=.env`: it loads a local
file when present, while externally injected environment variables take precedence.
Run it from the project root. Production platforms may inject variables and run
`node .output/server/index.mjs` directly without a dotenv file.

`HOST` and `PORT` select the listener (default port: 3000). For example:

```sh
HOST=0.0.0.0 PORT=3000 npm start
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` **before building**;
Vite embeds these public values in the browser bundle. Set `SUPABASE_URL` and
`SUPABASE_PUBLISHABLE_KEY` at **runtime** for SSR and authenticated server functions.
These should address the same backend (the server URL may be its internal address).
Changing browser settings requires rebuilding. The server-only
`SUPABASE_SERVICE_ROLE_KEY` is additionally required for privileged admin account
management; never expose it through a `VITE_` variable.

The existing database needs its content, roles/RLS policies, authentication
configuration, and `media` storage bucket. This change does not provision or migrate
those resources. Password-reset redirect URLs must be authorized for the intended
site origin in the existing backend before production use.

In managed environments requiring an HTTP proxy, Node 24 can route fetch requests
through inherited proxy settings with `NODE_USE_ENV_PROXY=1 npm start`. Preserve
configured CA trust and TLS verification. This setting is not needed for ordinary
direct-network deployments.

## Validation

```sh
npm test
npm run typecheck
npm run build
npm run lint
```

The repository has existing lint/formatting failures; this phase does not apply
mass formatting. Tests cover utilities, access rules, and route matching, not a
complete authenticated backend workflow.

After starting the compiled server, check its static responses:

```sh
curl --fail http://127.0.0.1:3000/robots.txt
curl --fail -o /dev/null http://127.0.0.1:3000/images/hero.jpg
curl --fail http://127.0.0.1:3000/
```

Static responses verify HTTP serving, not database readiness. The homepage must
render clinic content against a reachable backend before database-backed SSR can
be considered verified. Login, admin authorization, appointments, and uploads
also need functional validation with authorized test accounts.

The existing custom SSR server entry and CSRF middleware remain in place.
Nitro is currently pinned to `3.0.260603-beta`; upgrades should be tested explicitly.
Optional external resources include Google Fonts, map links/embeds, and gallery
video embeds. Preview-auth and error-reporting helpers still contain optional
Lovable editor hooks; normal standalone hosting does not require that editor.
