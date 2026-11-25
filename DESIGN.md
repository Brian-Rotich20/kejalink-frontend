# KejaLink design system

> Status: provisional, written before the build as the brief requires. Impeccable's documenter
> rewrites it from the shipped code at the finish review.

## The idea: the stage board

Nairobi already has a public, trusted visual language for "where is this going, what does it cost,
is there room": the **matatu**. Route boards in condensed caps, the PSV yellow band carrying route and
capacity facts, the conductor calling out a stage. KejaLink treats every listing as a matatu that has
pulled into the stage with its route board up: _the area, the price, whether there's room_.

- **Why it fits:** seekers already read matatu boards fluently, fast, on the move. The facts a
  matatu carries (destination, fare, space) map one-to-one onto what a seeker scans for (area, rent,
  availability). It is unmistakably Nairobi without costumes, flags or caricature.
- **What it refuses:** the property-portal grid of floating rounded cards on grey with a blue
  button; the luxury-dark "residences" look; SaaS gradients and glass.

### Rejected alternatives

| Direction                                | Why not                                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| Duplicate receipt book and rubber stamps | Very resonant for rent, but paper + stamps lands in the editorial "cream + serif" rut         |
| Hand-painted duka signwriting            | Charming, but lettering by hand is hard to do honestly in a type system, and risks caricature |
| M-Pesa SMS receipts                      | Strong trust cue, but turns the whole product into a monospace costume                        |
| Kanga borders and sayings                | Beautiful, but ornamental; competes with listing photos                                       |
| "TO LET" gate signs                      | The literal reading of the category; one note, not a world                                    |
| Split-flap board (catalog challenger)    | Kept as a discipline for dashboards (fixed columns), not as a look                            |
| VHS rental wall (catalog challenger)     | Kept as a discipline: taken places stay visible, marked "Taken"                               |

## Colour (OKLCH, semantic tokens)

Strategy: **Committed.** The yellow band owns whole regions; ink and body-white do the rest.

| Token                                           | Role                                                        |
| ----------------------------------------------- | ----------------------------------------------------------- |
| `--surface` / `--surface-2` / `--surface-sunk`  | body-paint white ground, raised panel, sunken field         |
| `--ink` / `--ink-2` / `--ink-3`                 | vinyl black text, secondary, tertiary (all AA on surface)   |
| `--board` / `--on-board`                        | route-board ink panel and its text                          |
| `--band` / `--on-band`                          | PSV yellow band and the ink set on it (primary action)      |
| `--accent`                                      | focus and links (deep matatu-livery blue, never a gradient) |
| `--success` / `--warning` / `--danger`          | semantic feedback                                           |
| `--status-pending/confirmed/rejected/cancelled` | booking states, always with a label and an icon             |
| `--status-published/rejected`                   | listing moderation states                                   |

Dark mode: tokens are defined for `[data-theme="dark"]`; it ships only after the quality gates pass.

## Type

- **Display:** Archivo, `wdth` 62–75, weight 800–900, uppercase, tight tracking (≥ -0.02em),
  tabular figures for money.
- **Text/UI:** Atkinson Hyperlegible Next 400/600/700.
- Fluid scale from `--step--1` to `--step-6` (clamp-based); body 16–17 px, line length ≤ 70ch.

## Space, radius, elevation

- Spacing on a 4 px base (`--space-1` = 4 px … `--space-16` = 64 px), 8 px rhythm for layout.
- Radius: painted panels, square-ish: `--radius-xs` 2, `--radius-sm` 4, `--radius-md` 6, `--radius-pill` for chips only.
- Elevation: two soft, offset shadows (`--shadow-1`, `--shadow-2`) for sheets and dialogs only.
  Listing plates sit flat on the ground with a 1 px rule; no glowing cards.

## Imagery

- Photos come only from listers. They are always inside aspect-locked frames (4:3 cards, 3:2
  gallery), delivered through Cloudinary transforms (`f_auto,q_auto,c_fill,w_*`) so a slow phone
  never downloads more than it shows.
- A listing with no photo gets a designed "no photo yet" plate (route-board type on a sunken
  ground), never a stock photo.

## Motion

- One grammar, **pulling in:** a short horizontal travel (8–16 px) with an exponential ease-out of
  180–260 ms, transform and opacity only.
- The signature moment is the route-board readout, which flips line by line as filters change.
- Sheets and dialogs use a stiff spring with no bounce. Nothing loops, nothing is scroll-linked.
  `prefers-reduced-motion` turns travel into an instant state change.

## Components (built on Radix, fully restyled)

Button (band / board / quiet / danger), Field (label + hint + inline error), Select, Sheet (bottom
on mobile), Dialog, Tabs (status tabs), Badge/Plate (status), Toast (sonner), Skeleton, Avatar
(initials), Pagination, Table (dense, sticky header, tabular numerals).
