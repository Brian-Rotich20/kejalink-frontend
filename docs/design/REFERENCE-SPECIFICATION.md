# Reference implementation specification

Three reference images supplied on 2026-11-26 are the visual source of truth for the KejaLink
frontend. This replaces the editorial "Nairobi Urban Living" direction (Phases 1–3 of the earlier
redesign); its functional work (search, grouping, real photos, e2e harness) is kept.

Measurements below come from the images themselves. Each mock shows a ~790 px wide app frame; I
scale it to a 1440 px desktop (factor ≈ 1.82) and round to the 4 px grid. Colours were sampled
from the images with sharp (`scratchpad/sample.mjs`), taking solid areas, not anti-aliased edges.

## R1 — "REALL": search results with filters, list and map (primary reference)

**Screen:** property discovery, desktop. Maps to `/properties`.

**Composition (left → right, full width under the header):**

| Region | Mock px | At 1440 | Notes |
|---|---|---|---|
| Header | 42 tall | 72 px | white, 1 px bottom border |
| Filter column | 166 wide | 300 px | white, own scroll, 24 px padding |
| Results list | 271 wide | ~500 px | ground `#f8f8fa`, cards stacked, own scroll |
| Map | rest (~314) | fills | flush to the right edge, no radius |

- **Header:** logo mark + bold wordmark left; text nav (Buy / Rent / Sell / Rent out) set ~60 px
  after the logo, 14 px medium grey, active item dark green and bold; a wide grey search field
  (`#f8f8fa`, 8 px radius, orange search icon) right of centre; then bookmark icon, bell, avatar
  (32 px, rounded 8 px).
- **Filters column:** heading "Filters" 16 px semibold; groups separated by ~24 px; group labels
  13 px semibold ink. Property type is a 2×2 grid of square tiles (icon over label, 8 px radius):
  selected tile solid green `#095650` with white icon and label, idle tiles `#edf4f6` with green
  icon and grey label. Checkbox lists (16 px boxes, green when checked, label green when checked).
  Price range: a dual-handle green slider, then two small boxed min/max values and a solid green
  "Ok" button in one row. Bedroom / bathroom: small steppers (− value +) on light green squares.
  Area range: another slider row. "Additional conveniences": checkbox list.
- **Results header:** "Search results 547" (15 px semibold) left; a small white sort select with
  chevron right ("Added today").
- **Result card (list):** white, 8 px radius, no visible shadow, 12 px padding, 8 px gap between
  cards. Photo left ~180×168 (≈ 1.07:1, 6 px radius, object-cover). Right side: title 16 px bold
  ink; address line 12 px grey; a row of three light grey chips (icon + number: beds, baths, sqft);
  price at the bottom, 18 px bold green `#095650` with "/month" in the same colour at 13 px. A
  bookmark icon top-right in orange `#f26a21`, outline when idle, filled when saved.
- **Map:** light grey basemap (`#f2f2f2` land, white roads), small orange dots for results, one
  white price card (photo thumb + green price + address) on the selected pin, a green "you" pin.

## R2 — "Krakow": list with filter pills and floating map card

**Screen:** discovery for a place query, tablet/laptop. Maps to `/properties?area=…` and the
mid-width layout.

- Page ground `#f3f3f3`; content in one large white rounded (24 px) frame on the mock. In the app
  the frame becomes the page itself.
- Centred search pill in the header with an orange circular search button (`#fc6814`).
- **Title block:** the place name as a heavy 28 px heading ("Krakow"), the count under it in
  12 px grey ("889 listings"); "Sort by: Newest" right-aligned on the same line.
- **Filter pills row:** rounded-full pills, 36 px tall, white with no border when idle, orange
  border and orange text when a filter is active (Apartment, 2 bedrooms), "More filters →" last.
- **List card:** white, 16 px radius, photo left (~40 % of the card, 12 px radius), heart top
  right, title 15 px semibold (2 lines), location 12 px grey, icon facts row (rooms, m²), bottom
  row: provider kind ("Private offer") 11 px grey left, price 16 px bold orange right.
- **Map:** 16 px radius, sits beside the list; "Search as I move the map" checkbox chip at the top;
  +/− zoom buttons (orange plus); a floating card (photo, title, facts, price) above the selected
  pin.

## R3 — "LedigBolig": search bar, filter sidebar, three-column grid

**Screen:** discovery in grid view, desktop. Maps to `/properties?view=grid`.

- White page. Header: logo left; user name + avatar and a solid green "Add Property" button right.
- **Search row:** a full-width input (40 px, 1 px border, 8 px radius, search icon inside) with a
  solid green "Search" button (icon + label) at the end.
- **Sidebar (~230 px at 1440):** "Filters" left and "Reset filters" right on one line; collapsible
  groups with chevrons: Area (select), Property type (checkboxes), Min/Max price (two selects
  side by side), Bedroom/Bathroom (two selects), etc.
- **Toolbar:** "Results: 45 Properties Found" left; right: icon toggles (filter, grid, map) as
  32 px squares (active solid green, idle white with border) and a "Sort by: Popular" select.
- **Grid card:** 3 columns, 16 px gap. White card, 8 px radius, soft shadow. Photo on top (≈ 3:2,
  radius on top corners). Body: price 14 px bold green, then title 12 px ink with "3 hours ago"
  right-aligned grey; a hairline, then a facts row with icons (type, beds, size).

## The KejaLink system derived from R1–R3

R1 is the most complete and sets the base; R2 contributes the orange accent, the filter pills and
the floating map card; R3 contributes the search row, grid view and view toggles. All three agree
on: white surfaces on a very light grey ground, one deep green for primary actions and prices, an
orange accent for map pins and saved items, sans-serif type throughout, small radii (6–8 px) on
controls and cards, hairline borders instead of shadows (R3's soft shadow kept for grid cards).

| Token | Value | Source |
|---|---|---|
| ground | `#f6f7f8` | R1 list bg `#f8f8fa`, R2 `#f3f3f3` |
| surface | `#ffffff` | all |
| sunk (idle tile, chip) | `#edf3f4` | R1 idle tile `#edf4f6` |
| line | `#e4e7ea` | R1/R3 borders |
| ink | `#1f2427` | titles |
| ink-2 | `#5b6368` | body, labels |
| ink-3 | `#8a9196` | meta (AA on white checked per use) |
| primary | `#095650` | R1 selected tile, price |
| primary-hover | `#07463f` | derived |
| primary-soft | `#e3efed` | R1 stepper squares |
| accent | `#f26a21` | R1 pins/bookmark, R2 `#fc6814`; text uses `#c4500f` for AA |
| map-land | `#f2f2f2` | R1 |

Type: **DM Sans** for everything (closest open match to R1/R3's geometric sans); headings bold
700, titles 600, body 400. Scale (px): 12, 13, 14, 16, 18, 22, 28, 36. Newsreader is removed.

Radii: 6 (chips, inputs), 8 (cards, buttons, tiles), 12 (map, R2 cards on mobile), 999 (pills).
Elevation: none on list cards; `0 1px 2px rgb(16 24 40 / .06), 0 1px 3px rgb(16 24 40 / .08)` on
grid cards and the map card; overlays (menus, dialogs) one larger shadow.

## Responsive behaviour (derived, no mobile reference supplied)

| Width | Discovery layout |
|---|---|
| ≥ 1280 | R1: filters 300 / list 500 / map rest (list view); R3 grid: filters 260 / 3-col grid |
| 1024–1279 | filters 260 + list or 2-col grid; map on the toggle replaces the list area |
| 768–1023 | R2: pill filter row + "More filters" sheet; list cards; map toggle |
| < 768 | R2 pills (scrolling row), stacked cards (photo top), a floating "Map" button that opens a full-screen map with the R2 card on the selected pin |

## Features in the references, checked against the backend

| Feature | Backend today | Decision |
|---|---|---|
| Text search, area, county | `q`, `area`, `county` | Wire header search + filters |
| Property type tiles | `propertyType` (single) | Tiles, one selected at a time |
| Price range slider + Ok | `minPrice`, `maxPrice` | Dual slider + inputs, applied on Ok |
| Bedrooms stepper | `bedrooms` (exact) | Add `minBedrooms` (additive) so "2+" works; stepper shows "Any" at 0 |
| Bathrooms stepper | stored, not filterable | Add `minBathrooms` (additive) |
| Additional conveniences | `amenities` stored, not filterable | Add `amenities` (all-of, comma list) |
| Sort | newest, price asc/desc | Select with those three |
| Results count | `meta.total` | Shown |
| Pagination | page/limit | Kept below the list |
| Grid/list/map toggle | n/a (frontend) | `view` URL param |
| Map with pins | **no coordinates** | Add nullable `latitude`/`longitude` + bounds query (`north,south,east,west`); listers place a pin in the form; the map shows only listings that have one, and says how many lack a pin |
| "Search as I move the map" | needs bounds query | Uses the bounds params above |
| Bookmark / heart | **no saved listings** | Add `saved_properties` + `GET /api/saved`, `PUT`/`DELETE /api/saved/:propertyId` (signed in) |
| Header bookmark icon | as above | Links to `/saved` |
| Notification bell | no notifications | Not built: no backend concept; requests pages already show status. Recorded, no dead control |
| Rental period (letly/inmly) | rent is monthly only | Not built; prices say "/month" |
| Area (sqft) range, sqft chip | no size field | Not built; chips show beds and baths only |
| "Private offer / agency" label | no lister type | Not built |
| Buy / Sell nav | rentals only | Nav is Browse, How it works, List a place |

All backend changes are additive (new optional fields, new optional query params, new routes) on
`feat/frontend-support`; existing requests and responses are unchanged. The frontend treats the
new fields as optional, so it keeps working against an API without them (map and saving then
explain they are unavailable).

## Screens without a reference

Landing, listing detail, auth, seeker/lister dashboards and admin have no reference image. They
are built from the same tokens and components: the R1 header, R3 search row, R1/R3 cards, white
panels on the ground, green primary buttons, the orange accent only for saved items and pins.

## Decisions recorded

1. R1's teal green is used exactly (`#095650`); R3's lighter mint is not mixed in.
2. Orange text fails AA on white at R1's value, so orange is used for icons, pins and borders;
   orange text (R2 active pills) uses `#c4500f` (4.6:1).
3. The map uses Leaflet 1.9 (lazy-loaded, only on the map view) with a light raster basemap set
   by `NEXT_PUBLIC_MAP_TILES_URL` (default CARTO Positron, attribution shown). The tile provider's
   terms must be confirmed before heavy production use.
