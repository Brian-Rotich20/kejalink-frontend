# Frontend decisions

Decisions taken without asking, per the brief. Each is the default I applied, with the reason.

## F-01 Repository and branch

The monorepo root's `.git` had been moved to `.git-backup`, and `frontend/` is its own repository
(`origin = github.com/Brian-Rotich20/kejalink-frontend`). That is the repo that contains
`frontend/`, so all work happens there on `feat/frontend`. `.git-backup` and `backend/` are not
touched.

## F-02 Next.js 16.4 with Cache Components kept on

The scaffold ships `cacheComponents: true` and `partialPrefetching: true`. I kept both. Data is
dynamic by default and public API reads use `"use cache"` + `cacheLife`, called at request time
(behind `await connection()` or inside a dynamic segment). No fetch runs at build time, so
`next build` succeeds when the Render API is asleep or down. Route segment `revalidate` / `dynamic`
configs are not used, because Cache Components replaces them. Middleware is `src/proxy.ts`, the
Next 16 name.

## F-03 Design process ran unattended

The brief asked not to be interviewed. Impeccable's init interview and direction decision page
were therefore answered from the brief. PRODUCT.md marks inferred facts, and the roll's assigned
direction was built without a decision round. No image generation was available, so the build is
code-led.

## F-04 Taste Skill used for principles, not its static-site pipeline

`design-taste-frontend` targets static company sites: a static export, stand-in stock photographs
and a gate run on built HTML. Two of its rules conflict with the brief: stock or stand-in photos
(the brief forbids invented content; listing photos come only from listers) and `output: "export"`
(the app needs a server for the proxy and RSC). I applied its house rules where they hold:

- no captions under images
- equal content edges
- one action per screen region
- hover/press micro-interactions
- verb-plus-object buttons
- the copy rules
- no violet

I did not apply the stock-photo, static-export or shader rules.

## F-05 21st.dev Magic MCP not connected

`claude mcp list` shows no `magic` server, so components are built on Radix primitives (via
`radix-ui`) and fully restyled. Connecting it is listed for the owner.

## F-06 Typography

Archivo (variable, `wdth` 62–125) sets route-board display caps at narrow width; Atkinson
Hyperlegible Next sets all reading text, chosen for legibility on mid-range screens in outdoor
light. That makes two families, loaded via `next/font`, subset to Latin.

## F-07 Dependencies

I kept the list minimal:

- next, react
- better-auth (client only; pinned to the backend's exact version, 1.7.28)
- @tanstack/react-query (mutations and client lists)
- nuqs (URL filter state)
- react-hook-form + @hookform/resolvers + zod (forms; same rules as the backend)
- radix-ui (accessible primitives)
- motion (motion)
- lucide-react (icons)
- sonner (toasts; accessible live region)
- clsx + tailwind-merge + class-variance-authority (variant styling)
- server-only (guards server modules)

Dev:

- vitest, Testing Library, jsdom
- Playwright with @axe-core/playwright
- prettier with prettier-plugin-tailwindcss

`@types/node` is pinned to ^22 because Vitest 5 requires it.

## F-08 Same-origin API proxy

`src/app/api/[...path]/route.ts` forwards every `/api/*` call to `API_INTERNAL_URL`.

- **Request headers:** it forwards an allow-list only: cookie, content-type, origin, user-agent,
  accept, accept-language and if-none-match. It never forwards host, content-length, authorization
  or the API's internal `x-kejalink-client-ip`.
- **Client IP:** it sets `X-Forwarded-For` to the visitor IP taken from Vercel's `x-real-ip` /
  `x-forwarded-for`.
- **Body:** it streams the body with `duplex: "half"`, multipart included.
- **Response:** it uses `redirect: "manual"`, rewrites any absolute `Location` back onto the site,
  and returns every `Set-Cookie` separately via `getSetCookie()`. It strips CORS headers (meaningless
  same-origin) and stale `content-encoding` / `content-length`, and is never cached.
- **Failures:** an unreachable API returns 502 `NETWORK_ERROR`; a timeout returns 504 `TIMEOUT`.
  Both come back in the app envelope.
- **Health:** `/healthz` reports proxy health, and `/healthz?upstream=1` also wakes and checks the
  API. It does not live under `/api`, so the proxy cannot shadow the API's own `/api/health`.

## F-09 Client IP through two proxies: TRUST_PROXY=2 on Render

The chain is browser → Vercel (our proxy sets `X-Forwarded-For: <client>`) → Render's edge (which
appends Vercel's egress IP) → API. With `TRUST_PROXY=1` the API would see Vercel's egress IP, so all
users would share one rate-limit bucket (sign-in is limited to 10/min). With `TRUST_PROXY=2` the API
reads the client IP our proxy set.

Trade-off: a client calling the Render URL directly can choose its own rate-limit key by sending
`X-Forwarded-For`. It cannot gain any privilege that way, only a fresh bucket. The alternative, a
shared-secret header, needs a backend change, which the brief rules out.

## F-10 Optional Origin rewrite for preview deployments

Each Vercel preview has its own origin, and the API's CSRF allow-list (`FRONTEND_URL`) cannot list
them all. When `API_FORWARDED_ORIGIN` is set, a request whose `Origin` equals this deployment's own
origin is forwarded with `Origin: API_FORWARDED_ORIGIN`. Any other Origin is forwarded unchanged,
so cross-site requests are still refused by the API. It is off by default.

## F-11 Server reads and caching

- `publicGet` (anonymous, cacheable in `"use cache"`) and `authedGet` (forwards the incoming
  cookie) call `API_INTERNAL_URL` directly.
- Both retry cold starts twice, with 0.8 s / 2.4 s backoff, on network errors and 502/503/504.
- `getServerSession` is deduplicated per request with React `cache()`.
- Browser GETs retry through TanStack Query with the same predicate and backoff. Mutations never
  retry automatically, because a repeated POST could double-book.

## F-12 Images through Cloudinary, not Vercel

`images.loaderFile` points `next/image` at a Cloudinary loader that inserts
`f_auto,q_auto,w_<n>,c_limit`, plus `ar_*,c_fill,g_auto` crops for aspect-locked frames. Cloudinary
serves AVIF/WebP at the right width, and Vercel's image-optimisation quota is never used.

## F-13 E2E backend harness (no backend change)

`npm run e2e:backend` runs the real `backend/src` app on a throwaway database whose name must
contain "test" (`kejalink_e2e_test`), with every env var set explicitly so nothing is read from
`backend/.env`. It injects a fake image host via the backend's own `setImageStorage` seam; the fake
returns Cloudinary's public demo images, so the frontend's loader is exercised for real. The local
dev server points at it through a gitignored `.env.local`, so local writes never reach production.

## F-14 Fresh availability beats cache

Public listing reads are cached for 30 s at most. Two safeguards keep availability accurate:

- The proxy calls `revalidateTag("properties", { expire: 0 })` after any successful write to
  `/api/properties`, `/api/bookings` or `/api/admin/(properties|users)`.
- The booking panel re-checks the listing live on mount.

`"use cache"` storage is per instance on serverless, so the live check is the one that guarantees
a taken place never offers a request button.

## F-15 Not-found is a value, not an exception, across the cache boundary

Errors thrown inside a `"use cache"` function are serialised and lose their class. `instanceof
ApiError` then fails, and a removed listing showed "didn't load" instead of the 404.
`getPublicProperty` therefore returns `null` for 404/422 and throws only for real failures, which
are never cached.

## F-16 Streaming pages answer 200 for a missing listing

Under Cache Components the listing page streams its shell before the data arrives. A missing
listing renders the designed 404 with `noindex` after a 200 status line; Next's documented
behaviour. Unknown routes (no matching segment) still return a real 404.

## F-17 Forms are inert until hydrated

Login, register and the listing form keep their submit button disabled until React hydrates, and
use `method="post"`. A native submit before hydration would otherwise send a GET with the password
in the URL, and React Hook Form ignores values typed before hydration anyway.

## F-18 Admin "suspend vs ban"

The API treats SUSPENDED and BANNED the same way: sign-in is blocked and every session is revoked.
The UI presents suspend as temporary and ban as being for fraud or abuse, and lets both be
reactivated. A "ban is permanent" claim would not be true, so the UI does not make it.

## F-19 Status labels

The API says REJECTED for both bookings and listings. People read "Declined" for an answered
request and "Taken down" for a moderated listing; the codes are unchanged.

## F-20 Uploads go through the proxy (Vercel's 4.5 MB body cap)

Photos are resized in the browser to a 1600 px long edge and re-encoded as WebP, or JPEG where
WebP encoding isn't available. Quality steps down from 0.82 until the photo is under 3.5 MB. EXIF
orientation is applied. A 1 MB+ camera-size JPEG is uploaded in e2e to prove it.

## F-21 Finish review: ink, not slate

Impeccable's independent finish reviewer returned **fix** with eight material items, all applied
in one batch. Its verdict pass then scored every one **resolved**:

1. The ink family is neutral vinyl black (hue 90, chroma 0.004), not blue-black slate.
2. Links and the focus ring are ink; there is no link blue.
3. The "Where to?" label above the board is screen-reader only.
4. Yellow is reserved for the band, band rules, the KNBS fact strip and one primary action per
   screen.
5. The listing plate's ink board carries area, fare and availability.
6. The KNBS figures are one band fact strip set in a sentence (no big-number block).
7. Every public section closes on the band rule.
8. Phones get a visible "Sign in", and local fixtures are authored, labelled samples with no
   stand-in photos.

Open, not scored: at 360 × 780 the safety band starts ~29 px below the fold. "Show places" is
inside it.

## F-22 Performance: what we measured and how

Lighthouse 12 and 13 cannot record a performance trace on the installed Chrome 158
(`NO_NAVSTART`), and installing an older Chromium failed. Accessibility, Best Practices and SEO ran
normally. Performance was measured with `e2e/measure/vitals.mjs`, which applies Lighthouse's
mobile throttling for real (4× CPU, 150 ms RTT, 1.6 Mbps down) and reads LCP, CLS and long-task
time over 3 runs.

To bring the landing page down from 284 KB to 229 KB of initial gzipped JS:

- The browser env module no longer uses Zod (about 39 KB). The server still validates with Zod
  at startup.
- The Better Auth plugin is built locally, so the `better-auth/client/plugins` barrel stays out of
  the bundle.
- The toaster and the phone menu sheet load lazily.

The remaining 229 KB is mostly the React 19 + Next 16 runtime (react-dom alone is 72 KB), so the
brief's ~170 KB target is not met.

## F-23 Streaming metadata kept

Dynamic pages stream their `<title>`/description (Next 16's default). HTML-limited crawlers still
get blocking metadata, and Google renders JS. Lighthouse's SEO audit therefore flags "no meta
description" on `/properties` and listing pages. Forcing blocking metadata for every visitor
(`htmlLimitedBots: /.*/`) would add the API round-trip to TTFB on every page view, which we judged
worse for this audience on 3G.

## F-24 Zod runs jitless

Zod 4 probes for `eval` (`Function("")`) to enable its JIT. The CSP forbids eval, so the probe only
logged a CSP issue. `z.config({ jitless: true })` is set where the schemas load.
