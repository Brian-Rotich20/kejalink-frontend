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
