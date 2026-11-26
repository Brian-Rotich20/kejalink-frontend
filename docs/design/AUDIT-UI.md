# UI audit before the redesign

Date: 2026-11-26. This is Phase 1 of the "Nairobi Urban Living" redesign; no code was changed for it.

**Method**
- The production build ran locally against the real API code on a throwaway test database. Data:
  - authored sample listings;
  - a seeker with pending, confirmed and declined requests;
  - a lister with three listings;
  - the seeded admin.
- `e2e/measure/audit-capture.mjs` captured 23 routes at 360, 390, 768, 1024 and 1440 px, signed
  out and as each role. The captures are in `.impeccable/review/audit-before/` (local, not committed).
- Functional baseline: the full Playwright suite passes (48 tests, 2 layout-specific skips), and
  no route overflows horizontally at any width.

## 1. What exists

| Layer | Inventory |
|---|---|
| Routes | Public: `/`, `/properties`, `/properties/[id]`, `/how-it-works`, `/privacy`, `/terms`. Auth: `/login`, `/register`, `/suspended`. Areas: `/seeker` (overview, requests, request detail, account), `/tenant` (overview, listings, new, edit + photos, requests, request detail, account), `/admin` (overview, users, listings, requests, request detail, account) |
| Tokens | `src/app/globals.css`: OKLCH semantic tokens (surface, ink, board, band, status), a fluid type scale `--step--1…6`, 2/4/6 px radii, two shadows, motion durations |
| Type | Archivo (condensed caps, "board type") for every heading and price; Atkinson Hyperlegible Next for text |
| UI primitives | Button, Field / Input / Select / Textarea, Dialog / Sheet, ConfirmDialog, Tabs, Table, Pagination, Skeleton, StateBlock, Avatar |
| Domain components | PropertyPlate (card), RouteBoardSearch, BookingPanel, Gallery, RequestCard, BookingTimeline, ContactReveal, StatusBoard, status plates, RequestsList, AccountForm, PropertyForm, PhotoManager |
| Logic to protect | `src/lib/api/*` (proxy client, Zod schemas, errors, retries), `src/lib/auth/*` (Better Auth client, guards, role redirects), `src/proxy.ts`, `src/app/api/[...path]`, filters in the URL (nuqs), every mutation hook |

**Usage counts:**
- "board type" condensed caps: 66
- ink `bg-board` panels: 43
- yellow `bg-band`: 14
- bordered rounded containers: 28
- dashed `StateBlock` boxes: 14
- Lucide icons: imported in 39 files

## 2. Functional findings (separate from the visuals)

| # | Finding | Severity | Plan |
|---|---|---|---|
| F1 | The availability switch on a listing with a confirmed booking offers "Available", and the API refuses it (409 `PROPERTY_HAS_CONFIRMED_BOOKING`). The error is explained in a toast, but the control invites a failing action. The owner list endpoint doesn't say whether a confirmed booking exists. | Medium | Keep the API contract. Explain the rule next to the switch when the listing is Taken. |
| F2 | The listing page repeats the availability plate: once in the panel and once under the title. | Low | Show it once, in the price block. |
| F3 | The panel's "Request a viewing" heading still shows when the place is taken and no request is possible. | Low | The heading follows the state. |
| F4 | Lighthouse can't trace performance on Chrome 158; JS was measured instead (landing 229 KB gzipped initial). | Known | Keep measuring with `vitals.mjs`. |
| F5 | Streaming metadata means the Lighthouse SEO audit sees no description on dynamic pages. | Known, by design | No change (F-23). |

No broken flows were found. Sign-up, sign-in, role redirects, requests, confirm/decline/cancel,
listing create and edit, uploads and admin moderation all pass end to end.

## 3. Visual diagnosis against the new brief

The current UI is coherent, but its identity, the "matatu stage board", is the opposite of what the
brief now asks for: an editorial, restrained publication with photography in the lead. Specific
problems:

1. **Shouting type everywhere.**
   - Condensed black caps set every heading, from the H1 to small section titles ("Latest",
     "What's here", "About this place").
   - Area names on cards and the "Habari, Otieno" greeting use it too.
   - With everything at maximum volume there is no hierarchy, which is the brief's "huge headings
     with little information".
2. **Heavy black slabs.**
   - Ink panels are used as components: the hero search, every card strip, the dashboard status
     board, the CTA block and the footer.
   - The seeker overview's status board stretches into a ~500 px black block holding two numbers.
3. **Yellow as decoration.**
   - The dashed "band rule" between sections and the yellow strips are ornaments.
   - Yellow also sits on the switch, nav underline and count badges (documenter drift note).
4. **Photography is not the focus.**
   - The card is photo → black strip → white body, so the black strip competes with the photo.
   - With no photos, a grey "No photo yet" box takes 60% of every card and the grid reads as empty
     boxes.
   - The listing page has the same problem at full width.
5. **Too many boxes.**
   - Rounded bordered containers sit inside sections: steps lists, the stay-safe box, the lister
     card, facts grids, request cards with thumbnail wells.
   - The how-it-works section is two boxed lists side by side, and the trust section is a box next
     to a paragraph.
6. **Badges for everything.**
   - Status, availability and "Live" are all chips.
   - Amenities are bordered chips. The admin listing row carries a status chip, an availability
     line and a lister chip.
7. **Every section is the same template.** A caps heading and a short paragraph, then a grid or a
   box, repeated four times on the landing page.
8. **The dashboards don't prioritise work.**
   - The tenant listings page uses the public card at full size with controls stacked below. Three
     listings fill 1.5 screens at 1024 px.
   - The seeker overview spends half its width on a black counter.
9. **Phone first viewport.** At 360 px the safety line falls just below the fold, and the hero
   search's black block dominates the screen.
10. **Copy register.** "Just pulled in", "The stage is quiet right now", "Wrong stage" and route
    board language belonged to the old metaphor; that has to go with it.

## 4. Keep, remove, redesign

**Keep (proven, functional):**
- Every route, the data flows and the components' props/behaviour.
- The URL filters, the request lifecycle UI, the confirm/decline/cancel dialogs with their stated
  consequences, and the photo manager pipeline.
- The cold-start states, the proxy and the auth.
- The 44 px targets, focus handling and reduced motion.
- Honest copy: no invented data, KNBS figures cited, "pay only after viewing".

**Remove:**
- Board type, ink slabs, the dashed band rules, yellow, and condensed caps for headings.
- The status-board black panel.
- Nested boxes around lists.
- The grey "No photo yet" slabs at full card size.
- Badge clutter (amenity chips, "Live" chips on cards).
- Route-board copy.

**Redesign:**
- The token system: ivory/limestone ground, forest green, charcoal, terracotta accent.
- Type: Newsreader for editorial headings, DM Sans for interface text.
- Every component skin (button, field, card, plate, table, tabs, dialog, toast, pagination,
  skeleton).
- Landing composition, the discovery card, the detail page layout, the auth layout, and the
  dashboard density.
