# KejaLink frontend

The web app for KejaLink, a rental marketplace for Kenya that is launching in Nairobi. It is built
with Next.js 16 (App Router, Cache Components, Turbopack) and runs on Vercel. It talks to the
Fastify API in `../backend`, which runs on Render.

- Product and design: [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md),
  [docs/design/REFERENCES.md](docs/design/REFERENCES.md), [docs/design/SHAPES.md](docs/design/SHAPES.md)
  and [docs/design/specs/](docs/design/specs/).
- Decisions: [docs/DECISIONS.md](docs/DECISIONS.md).

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill it in (see below)
npm run dev                    # http://localhost:3000
```

Run with no `.env.local`, the app reads from the production API on Render and can only browse.
**Never** register accounts or create listings against production; for anything that writes,
use the local backend below.

## Environment

Every variable is validated with Zod at startup (`src/lib/env`, `src/instrumentation.ts`). Blank
values count as unset.

| Variable                    | Where           | Default                                             | Purpose                                                                 |
| --------------------------- | --------------- | --------------------------------------------------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`      | build + browser | Vercel deployment URL, else `http://localhost:3000` | Canonical origin for metadata, sitemap and OG images                    |
| `API_INTERNAL_URL`          | server only     | `https://kejalink-api.onrender.com`                 | API origin for the `/api` proxy and server rendering (no `/api` suffix) |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | build + browser | not set                                             | Shown where V1 has no self-service path (password reset, appeals)       |
| `NEXT_PUBLIC_API_BASE`      | build + browser | not set (same origin)                               | Only for the custom-domain setup below                                  |
| `API_FORWARDED_ORIGIN`      | server only     | not set                                             | Lets preview deployments share one API `FRONTEND_URL` entry (see below) |
| `API_TIMEOUT_MS`            | server only     | `55000`                                             | How long the server waits for the API (cold starts take ~60 s)          |

`NEXT_PUBLIC_*` values are inlined at build time, so never put a secret in one.

## Scripts

| Script                            | What it does                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run dev` / `build` / `start` | Next.js                                                                                     |
| `npm run typecheck`               | `tsc --noEmit` (strict, `noUncheckedIndexedAccess`)                                         |
| `npm run lint` / `format`         | ESLint (Next core-web-vitals + TS) / Prettier                                               |
| `npm test`                        | Vitest unit tests: API layer, proxy, errors, retry, filters, formatters, forms, compression |
| `npm run e2e:backend`             | Starts the real API on a throwaway test database with a fake image host (port 5100)         |
| `npm run e2e:seed`                | Adds dev fixtures (clearly labelled) to the **local** API only                              |
| `npm run test:e2e`                | Playwright (Pixel 7 + desktop Chrome, axe included) against a production build on port 3100 |

> On Windows, run Vitest from PowerShell or cmd. Git Bash breaks Vitest's worker runner.

### Local backend for writes and e2e

1. Start a throwaway Postgres, e.g.
   `docker run -d --name kejalink-test-pg -p 127.0.0.1:56543:5432 -e POSTGRES_PASSWORD=… postgres:17`,
   then create a database whose name contains `test` (e.g. `kejalink_e2e_test`).
2. Create `frontend/.env.e2e` (gitignored) with `E2E_DATABASE_URL=…/kejalink_e2e_test`,
   `E2E_ADMIN_EMAIL=…` and `E2E_ADMIN_PASSWORD=…` (12+ characters).
3. `npm run e2e:backend`. The harness refuses any database whose name lacks `test`, sets every API
   variable explicitly (nothing is read from `backend/.env`), runs migrations, seeds the admin and
   swaps Cloudinary for a fake that returns Cloudinary's public demo images.
4. For local development, point the app at it in `.env.local`: `API_INTERNAL_URL=http://127.0.0.1:5100`.
5. Run `npm run test:e2e`. It builds, then runs `next start -p 3100` against the local API. Set
   `E2E_BASE_URL` to reuse a server you already have running.

## Architecture

```
browser ──▶ Vercel (this app) ──▶ /api/[...path] proxy ──▶ Render API (Fastify + Better Auth)
                │                                             ▲
                └── server components (publicGet / authedGet) ┘   direct, server-to-server
```

- **Same-origin proxy** (`src/app/api/[...path]/route.ts`, `src/lib/proxy/forward.ts`).
  - _Why:_ Vercel and onrender.com are different sites, so the API's `SameSite=Lax` session
    cookie would never reach it cross-site. The browser therefore only talks to this site.
  - _Request:_ the proxy streams bodies (multipart included) and forwards an allow-list of headers
    (cookie, content-type, origin, user-agent, accept, accept-language). It sets
    `X-Forwarded-For` to the visitor's IP. Requests use `redirect: "manual"` and are never cached.
  - _Response:_ every `Set-Cookie` is returned separately (`getSetCookie()`), so session cookies
    become first-party, host-only cookies on this domain.
  - _Cache:_ successful writes expire the cached listing pages.
- **Auth:** the Better Auth client (`src/lib/auth/client.ts`) uses this site as its base URL.
  `src/proxy.ts` (Next 16's middleware) does a cheap session-cookie check on `/seeker`, `/tenant`
  and `/admin`. Each area's layout then checks the real session and role on the server and
  redirects the wrong role to its own area.
- **Reads:**
  - Public pages call the API directly from the server: `"use cache"` with a 30 s lifetime,
    always at request time, so `next build` never calls the API.
  - Dashboards use TanStack Query through the proxy.
  - Every response is validated with Zod (`src/lib/api/schemas`).
- **Writes:** client mutations through the proxy, never Server Actions. The API requires an
  `Origin` header on cookie-authenticated writes.
- **Cold starts:** GETs retry twice (0.8 s, then 2.4 s) on network errors and 502/503/504. After
  4 s a calm "Waking the server up" note appears beside the skeletons, and `/healthz?upstream=1`
  wakes the API on demand.
- **Images:** a custom `next/image` loader inserts Cloudinary transforms
  (`f_auto,q_auto,w_*`, plus aspect crops). Uploads are resized in the browser to stay under
  Vercel's ~4.5 MB request cap.

## Deploying to Vercel

1. Import the repository in Vercel and set **Root Directory** to `frontend` (only needed if the
   repository root is the monorepo). The framework preset is **Next.js**, the build command is
   `npm run build` (the default), and the install command is `npm install`. Node 22+.
2. Set the environment variables from the table above for Production (and Preview, if wanted).
3. On Render, add the Vercel production URL to the API's `FRONTEND_URL`, and set `TRUST_PROXY=2`
   (see `docs/DECISIONS.md` F-09).
4. Deploy. Smoke-check `/healthz?upstream=1`, `/`, `/properties` and `/api/health`.

### Moving to a custom domain later (an env-only change)

Put the app at the apex (`kejalink.co.ke`) and the API on a subdomain (`api.kejalink.co.ke`):

1. Point `api.kejalink.co.ke` at Render as a custom domain, and `kejalink.co.ke` at Vercel.
2. On the API, set `BETTER_AUTH_URL=https://api.kejalink.co.ke` and
   `FRONTEND_URL=https://kejalink.co.ke`, and leave `CROSS_SITE_COOKIES` unset. App and API are
   now same-site.
3. On Vercel, set `NEXT_PUBLIC_SITE_URL=https://kejalink.co.ke` and
   `NEXT_PUBLIC_API_BASE=https://api.kejalink.co.ke` (browser calls go straight to the API), and
   `API_INTERNAL_URL=https://api.kejalink.co.ke`. Redeploy; the CSP picks up the API origin
   automatically.

The proxy keeps working throughout, so you can switch back by clearing `NEXT_PUBLIC_API_BASE`.

## Render cold starts

On Render's free plan the API sleeps after a quiet spell and takes up to ~60 s to wake. The app
handles this as follows:

- Server reads wait up to 55 s (`API_TIMEOUT_MS`). The proxy route has `maxDuration = 60`.
- Skeletons stay up, and the waking note appears after 4 s. Nothing shows a raw error for a cold
  start.

To avoid cold starts entirely, use a paid Render instance, or a keep-alive pinger that calls
`https://kejalink-api.onrender.com/api/health` every 10–14 minutes (an external uptime monitor).
