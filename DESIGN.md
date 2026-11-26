# KejaLink design system: "Nairobi Urban Living"

> Status: the direction for the redesign, written at Phase 2. The owner's brief pins it (palette
> roles, DM Sans + Newsreader, editorial language), so it was not rolled. Impeccable's documenter
> rewrites this file from the shipped code when the redesign is finished. The previous identity
> ("the stage board") is retired; see `docs/design/AUDIT-UI.md` for why.

## The idea

KejaLink reads like a carefully edited Kenyan property publication that you can also search and
act on:

- photographs lead;
- the type has an editor's hierarchy;
- the interface stays quiet until you need it.

Trust comes from restraint and precision, not ornament.

### Why it is Nairobi, not "warm editorial"

The brief pins a warm ground, a serif and an earthy accent, which is a well-worn combination. It
is made specific by taking each colour from the city instead of from a template:

| Role               | Source                                                                                    | Not                        |
| ------------------ | ----------------------------------------------------------------------------------------- | -------------------------- |
| Ground (limestone) | Nairobi building stone: the buff, slightly grey quarry stone of the city's older blocks   | page-cream `#F4F1EA`       |
| Brand (forest)     | Karura and Ngong Road forest greens: deep, slightly blue-green                            | mint, or SaaS emerald      |
| Accent (murram)    | The red laterite of murram roads and clay roof tiles, browner and darker than clay-orange | `#D97757`-style terracotta |
| Ink (charcoal)     | Warm charcoal                                                                             | tinted near-black `#111`   |

The accent is rare by rule: one editorial mark or one selected state per screen.

## Colour (OKLCH tokens, `src/app/globals.css`)

Strategy: **Restrained.** The limestone ground and ivory paper carry the page. Forest is the brand
and the primary action, plus at most one forest field per page (the lister section on the landing
page). Murram is used sparingly.

| Token                                           | Value                            | Role                                                          |
| ----------------------------------------------- | -------------------------------- | ------------------------------------------------------------- |
| `--ground`                                      | `oklch(0.955 0.011 84)`          | page                                                          |
| `--paper`                                       | `oklch(0.985 0.007 88)`          | raised surfaces, inputs, sheets                               |
| `--sunk`                                        | `oklch(0.928 0.012 82)`          | wells, image placeholders                                     |
| `--line` / `--line-strong`                      | `0.87` / `0.6`                   | hairlines / control borders (3.5:1)                           |
| `--ink` / `--ink-2` / `--ink-3`                 | `0.25` / `0.40` / `0.49`, hue 65 | text (14:1 / 8.1:1 / 5.5:1 on ground)                         |
| `--forest` (+ hover / press / soft / on-forest) | `oklch(0.40 0.075 158)`          | brand, primary action, links, focus                           |
| `--clay` / `--clay-soft`                        | `oklch(0.52 0.115 42)`           | murram accent (5:1 on ground)                                 |
| success / warning / danger / info (+ soft)      |                                  | system states                                                 |
| `--status-*`                                    | mapped to the above              | PENDING, CONFIRMED, REJECTED, CANCELLED; PUBLISHED, moderated |

Dark tokens are prepared under `[data-theme="dark"]`; dark mode is not shipped.

## Type

- **Newsreader** (variable, `opsz` 6–72) is for editorial headings and selected statements:
  - `.display` for page titles: weight 400, tracking −0.02em;
  - `.headline` for section titles: weight 500.
  - Sentence case throughout. No caps labels, no single italicised accent word.
- **DM Sans** (variable, `opsz`) is for interface text, labels, figures and tables.
  - `.figure` for money: 600, tabular numerals.
- **Scale:** UI steps are fixed at 0.875 / 1 / 1.125 rem. The editorial steps 2–6 are fluid, with
  6 capped at 4.5rem. Body text is ≤ 66ch.

## Space, shape, depth

- **Space:** 4 px base with an 8 px rhythm; 2 px micro-steps only between an icon and its label.
  Predictable widths: `--wrap` 75rem, `--measure` 66ch.
- **Radius:** 2 / 4 / 6 px. Pills are for dots only.
- **Depth:** hairlines separate things, and nothing nests more than one container deep. Shadows
  exist for overlays only (sheets, dialogs, toasts).

## Imagery

Photographs come only from listers, through Cloudinary transforms:

- aspect locked at 4:3 for cards and 3:2 for the gallery;
- cropped `g_auto`;
- responsive widths.

A listing without photos gets a quiet, compact placeholder that never takes over the card. No
stock photography, ever.

## Motion

Motion answers an action and nothing else:

- dialog and sheet open/close;
- press feedback (scale 0.98);
- toasts;
- the photo reorder.

There are no load-in reveals, no hover lifts and no loops. Durations are 120 / 180 / 240 ms on a
gentle ease-out. Reduced motion makes every change instant.

## Template tells removed (from `docs/design/AUDIT-UI.md`)

- condensed caps headings;
- ink slabs;
- yellow band strips and dashed rules;
- big-number stat blocks;
- nested boxed lists;
- chip clutter;
- `A · B · C` meta strings;
- `→` on links;
- caps labels;
- identical section templates.
