# 350space — environment variables

Reference for the environment variables introduced by the `/vesolje` feature.
Everything 350space-specific is prefixed with `CDSE_` (Copernicus Data Space
Ecosystem) or `VESOLJE_` so it cannot collide with the existing 350logatec
keys (`NEXT_PUBLIC_SUPABASE_*`, `RESEND_API_KEY`, `CRON_SECRET`, `VAPID_*`).

`.env.example` is intentionally **not** added: `.gitignore` already ignores
`.env*`, and we chose to leave that untouched. Document is the source of
truth; copy values into `.env.local` (for local dev) and into the Vercel
project (for preview + production).

## Keys

| Variable             | Scope          | Required | Used by                            |
| -------------------- | -------------- | -------- | ---------------------------------- |
| `CDSE_CLIENT_ID`     | Server-only    | Yes      | `src/lib/space/cdse-auth.ts`       |
| `CDSE_CLIENT_SECRET` | Server-only    | Yes      | `src/lib/space/cdse-auth.ts`       |

> Neither key is `NEXT_PUBLIC_*`. They must never leak to the browser bundle.
> `cdse-auth.ts` is server-only and is consumed exclusively from API routes /
> server components / cron handlers.

## How to obtain the CDSE OAuth client credentials

1. Sign in at https://dataspace.copernicus.eu (free account).
2. Open https://shapps.dataspace.copernicus.eu/dashboard/ — the Sentinel Hub
   dashboard that ships with every CDSE account.
3. Settings → OAuth clients → **Create OAuth client**.
4. Name it `350space-prod` (or whatever helps you recognize it later).
5. The dashboard shows the `client_id` and a one-time `client_secret`. The
   secret is **not** retrievable later — copy it now.

Note: a Sentinel Hub _instance ID_ is **not** required. We send the
evalscript inline with each Process API request, so we do not need a stored
configuration.

## How to add the values

### Local development

Append to `app/.env.local` (this file is gitignored):

```
CDSE_CLIENT_ID=...
CDSE_CLIENT_SECRET=...
```

Then restart `npm run dev` so Next.js picks up the new variables.

### Vercel

1. https://vercel.com/timsfiligoj/350logatec → Settings → Environment
   Variables.
2. Add both keys with values from the CDSE dashboard.
3. Enable for **Production** and **Preview** (no need for Development).
4. Redeploy the latest commit on `feat/vesolje` so the preview deploy
   picks them up.

## Phase 1 reality check

Phase 1 (the current skeleton) does **not** call CDSE. The variables are
declared and documented so that Phase 2 — the first manual fetch — has
nothing to set up at the env layer.
