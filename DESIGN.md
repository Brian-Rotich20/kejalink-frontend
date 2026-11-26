---
name: KejaLink
description: Real places to rent in Nairobi, set as matatus at the stage with their route boards up.
colors:
  surface: "oklch(0.985 0.002 95)"
  surface-2: "oklch(1 0 0)"
  surface-sunk: "oklch(0.955 0.003 95)"
  line: "oklch(0.89 0.004 90)"
  line-strong: "oklch(0.6 0.004 90)"
  ink: "oklch(0.18 0.004 90)"
  ink-2: "oklch(0.36 0.004 90)"
  ink-3: "oklch(0.47 0.004 90)"
  board: "oklch(0.17 0.004 90)"
  board-2: "oklch(0.25 0.004 90)"
  on-board: "oklch(0.97 0.003 95)"
  on-board-2: "oklch(0.82 0.006 90)"
  board-line: "oklch(0.34 0.004 90)"
  band: "oklch(0.87 0.165 92)"
  band-hover: "oklch(0.84 0.17 90)"
  band-press: "oklch(0.8 0.165 87)"
  on-band: "oklch(0.18 0.004 90)"
  accent: "oklch(0.18 0.004 90)"
  focus: "oklch(0.18 0.004 90)"
  success: "oklch(0.45 0.12 152)"
  success-soft: "oklch(0.94 0.05 152)"
  warning: "oklch(0.47 0.11 70)"
  warning-soft: "oklch(0.95 0.07 92)"
  danger: "oklch(0.5 0.19 27)"
  danger-soft: "oklch(0.95 0.035 25)"
  info: "oklch(0.45 0.13 250)"
  info-soft: "oklch(0.95 0.025 250)"
  status-cancelled: "oklch(0.42 0.004 90)"
  status-cancelled-soft: "oklch(0.94 0.003 90)"
typography:
  display:
    fontFamily: "Archivo, Atkinson Hyperlegible Next, ui-sans-serif, sans-serif"
    fontSize: "clamp(3rem, 2.1rem + 4vw, 6rem)"
    fontWeight: 850
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 68"
    fontFeature: "'tnum'"
  headline:
    fontFamily: "Archivo, Atkinson Hyperlegible Next, ui-sans-serif, sans-serif"
    fontSize: "clamp(2rem, 1.62rem + 1.7vw, 3.25rem)"
    fontWeight: 850
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 68"
    fontFeature: "'tnum'"
  title:
    fontFamily: "Archivo, Atkinson Hyperlegible Next, ui-sans-serif, sans-serif"
    fontSize: "clamp(1.625rem, 1.42rem + 0.9vw, 2.25rem)"
    fontWeight: 850
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 68"
    fontFeature: "'tnum'"
  body:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Fallback, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.97rem + 0.15vw, 1.0625rem)"
    fontWeight: 400
    lineHeight: 1.55
  body-lead:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Fallback, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.07rem + 0.25vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Fallback, system-ui, sans-serif"
    fontSize: "clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem)"
    fontWeight: 700
    lineHeight: 1.3
  plate:
    fontFamily: "Archivo, Atkinson Hyperlegible Next, ui-sans-serif, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 80"
    fontFeature: "'tnum'"
rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  pill: "999px"
spacing:
  micro: "2px"
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "14": "56px"
  "16": "64px"
  "20": "80px"
components:
  button-band:
    backgroundColor: "{colors.band}"
    textColor: "{colors.on-band}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "52px"
  button-band-hover:
    backgroundColor: "{colors.band-hover}"
  button-band-active:
    backgroundColor: "{colors.band-press}"
  button-board:
    backgroundColor: "{colors.board}"
    textColor: "{colors.on-board}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-board-hover:
    backgroundColor: "{colors.board-2}"
  button-quiet:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-ghost:
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface-2}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
  input-board:
    backgroundColor: "{colors.board-2}"
    textColor: "{colors.on-board}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "48px"
  property-plate:
    backgroundColor: "{colors.surface-2}"
    rounded: "{rounded.md}"
  property-plate-board:
    backgroundColor: "{colors.board}"
    textColor: "{colors.on-board}"
    padding: "12px 16px"
  status-plate:
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
    padding: "4px 8px"
  availability-plate:
    typography: "{typography.plate}"
    rounded: "{rounded.xs}"
    padding: "4px 8px"
  table-head:
    backgroundColor: "{colors.board}"
    textColor: "{colors.on-board}"
  table-cell:
    padding: "8px 12px"
---

# Design System: KejaLink

## Overview

**Creative North Star: "The Stage Board"**

Nairobi already has a public, trusted visual language for "where is this going, what does it cost, is there room": the matatu. Route boards in condensed caps, the PSV yellow band carrying route and capacity facts, the conductor calling out a stage. KejaLink is the stage at rush hour, and every listing is a matatu that has pulled in with its route board up: the area, the price, whether there is room. Seekers already read matatu boards fluently, fast, on the move, and the facts a matatu carries (destination, fare, space) map one-to-one onto what a seeker scans for (area, rent, availability). It is unmistakably Nairobi without costumes, flags or caricature.

The world is made of three materials and nothing else: a body-paint white ground, vinyl-black ink (a neutral black at hue 90, with no blue in it), and the PSV-yellow band. Ink is laid down as route-board plates, solid rectangles with condensed caps. Yellow is committed material: full-width strips that carry facts and safety lines, plus one primary action per screen. It is never sprinkled as an accent. Everything that is read is set in Atkinson Hyperlegible Next; everything that is called out like a board is set in Archivo, narrow and black.

Density is phone-first (360 px), with 44 px touch targets everywhere and the primary action low in thumb reach. The system refuses the property-portal default of floating rounded photo tiles on grey with a blue button. It also refuses the luxury-dark "residences" look, SaaS gradients and glass.

**Key Characteristics:**
- Three materials: white ground, vinyl-black ink plates, PSV-yellow band.
- Condensed black caps (Archivo, wdth 68, weight 850) for anything a conductor would call out; Atkinson Hyperlegible Next for everything read.
- Square-ish painted-panel corners (2 to 6 px). No gradients, no glass.
- Flat plates on 1 px rules; shadows only for hover lift, sheets and dialogs.
- Status is always a label plus an icon, never colour alone.
- Taken places stay visible, plated "Taken", instead of vanishing.
- One motion grammar: pulling in.

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

## Colors

A committed palette: neutral ink and white do almost all the work, and one saturated PSV yellow owns whole regions. Every colour is an OKLCH semantic token in `src/app/globals.css`; components use only the semantic names.

### Primary
- **PSV Band Yellow** (band, with band-hover and band-press for its states): the band itself, the dashed band rule, the full-width KNBS fact strip, the safety line under the hero, and the one primary action per screen (`button-band`). Text on it is always on-band ink.

### Neutral
- **Body-Paint White** (surface): the page ground, a warm near-white.
- **Panel White** (surface-2): raised panels, plates, fields, dialogs.
- **Sunk Ground** (surface-sunk): empty photo frames, disabled fields, skeletons, ghost hover.
- **Hairline** (line) and **Strong Rule** (line-strong): 1 px plate borders and dividers; field and quiet-button outlines.
- **Vinyl Black** (ink), **Ink Two** (ink-2), **Ink Three** (ink-3): body text, secondary text, hints and placeholders. All three are neutral at hue 90 and pass AA on surface.
- **Route Board** (board, board-2, board-line): the ink panels (header, route-board search, plate boards, table heads, the lister call-out), the raised field inside a board, and the rule between board rows.
- **On Board** (on-board, on-board-2): primary and secondary text on ink.
- **Link and Focus Ink** (accent, focus): both equal ink. Links are ink, underlined; the focus ring is a 2 px ink outline, switching to band on board panels.

### Semantic and status
- **Success / Warning / Danger** (success, warning, danger, each with a soft ground): inline feedback, form errors, destructive actions.
- **Info** (info, info-soft): neutral notices only, never links or actions.
- **Booking states:** PENDING uses warning on warning-soft (clock icon, "Pending"); CONFIRMED uses success on success-soft (check, "Confirmed"); REJECTED uses danger on danger-soft (circle-x, "Declined"); CANCELLED uses status-cancelled on status-cancelled-soft (ban icon, "Cancelled").
- **Listing moderation:** PUBLISHED uses success on success-soft (check, "Live"); REJECTED uses danger on danger-soft (eye-off, "Taken down"). In CSS these are `--status-published` and `--status-moderated`.

### Dark mode
The tokens are dark-mode-ready: `:root[data-theme="dark"]` redefines the ground, ink, board, focus and semantic families. Dark mode is **not shipped**: nothing sets `data-theme="dark"`, and it ships only once the light theme has passed every gate. The dark set still carries the earlier blue-tinted ink (hue 250 to 258) and must be re-tuned to the hue-90 neutral family before it ships.

### Named Rules
**The One Band Rule.** Yellow is the band, the band rule, the KNBS fact strip and one primary action per screen. It is a material, not an accent. If a second yellow thing appears in a region, one of them is wrong.

**The No Link Blue Rule.** Links and focus are ink. A link is ink text with a 55% ink underline that goes solid and 2 px thick on hover. Blue exists only as the info notice tone.

**The Label Plus Icon Rule.** Every status carries a word and an icon (or, for availability, a filled or hollow dot). Colour is the third signal, never the only one.

## Typography

**Display Font:** Archivo, variable `wdth` axis (falls back to Atkinson Hyperlegible Next)
**Body Font:** Atkinson Hyperlegible Next (with a metric-matched Arial fallback, "Atkinson Fallback")

**Character:** route-board lettering against a reading face built for legibility. The board face is condensed, black and uppercase, and shouts like a matatu destination; the text face is calm, open and made to be read on a cheap phone in sunlight.

### Hierarchy
The scale is fluid from 360 px to 1440 px, in nine steps from step -1 to step 6 (`--step--1` to `--step-6`).
- **Display** (board type, 850, step 6, 0.95): the hero headline only ("Tafuta keja yako.").
- **Headline** (board type, 850, step 4): section titles ("Just pulled in", the KNBS heading, the lister call-out).
- **Title** (board type, 850, step 3, or step 2 on plates): dialog titles, empty-state lines, the route-board readout, the plate's area and fare, KNBS figures inside the band.
- **Body lead** (Atkinson 400, step 1, 1.55): the promise under the hero, intro paragraphs. Max 68ch (`.measure`).
- **Body** (Atkinson 400, step 0 = 16 to 17 px, 1.55): everything read. Max 68ch.
- **Label** (Atkinson 700, step -1): field labels on boards, hints, status plates, metadata rows. Field labels on the ground are step 0 bold.
- **Plate** (board type wide: Archivo wdth 80, 800, 0.01em tracking, 13 px): availability plates, "No photo yet", the "KES" unit on fares.

### Named Rules
**The Board Type Rule.** Board type (`.board-type`: wdth 68, weight 850, uppercase, -0.01em, 0.95 line-height, tabular figures) is for what a conductor would call out: places, prices, headings, readouts. Sentences people read are never set in it.

**The Tabular Money Rule.** Money, counts, dates and tables use tabular figures, so fares and columns line up and only the values change.

## Layout

The content wrap is 76rem (1216 px) with a fluid gutter of 16 to 32 px. The header is a 56 px ink bar, sticky. Spacing runs on a 4 px base with an 8 px rhythm for layout: 12 px inside board strips and between fields, 16 px for card padding and band strips, 20 px plate grid gaps, 24 px and 40 px for panel padding, and 56 / 80 px vertical section padding (phone / desktop). The single documented exception is the **2 px micro-step between an icon and its label** (and the 2 px focus offset); nothing else is off the 4 px grid. Measured spec sheets live in `docs/design/specs/`.

Sections are full-bleed bands and rules punctuating a centred wrap. The hero is one column at every width: headline, promise, then the route board running full wrap width (a windscreen banner on desktop, never a split hero). Listing grids go 1, 2 then 3 columns (sm, lg). Two-part content splits at md or lg into asymmetric columns (1.1fr / 1fr). Every touch target is at least 44 px; the primary action on the route board is 48 px tall and sits low in thumb reach. Breakpoints are Tailwind defaults (sm 640, md 768, lg 1024, xl 1280).

**The Band Rule Close.** Every public section group closes on the same dashed band rule (a 12 px strip of 40 px yellow dashes with 8 px gaps), the broken line painted along a matatu.

## Elevation & Depth

Flat by default. Depth comes from material contrast: ink plates on white ground, white panels on a 1 px hairline, the yellow band cutting across. Shadows are a response, not a resting state.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 1px 2px oklch(0.18 0.004 90 / 0.06), 0 2px 6px oklch(0.18 0.004 90 / 0.06)`): a listing plate on hover, paired with a 2 px rise.
- **Sheet** (`box-shadow: 0 8px 24px oklch(0.18 0.004 90 / 0.14), 0 2px 6px oklch(0.18 0.004 90 / 0.08)`): dialogs and bottom sheets, over a 60% ink scrim.

### Named Rules
**The Flat Plate Rule.** Plates and panels sit flat on a 1 px rule at rest. No glowing cards, no ambient shadows.

## Shapes

Painted-panel corners, square-ish: 2 px for small plates (status, availability, wordmark halves, focus ring), 4 px for buttons and fields, 6 px for plates, boards, panels and dialogs. The pill radius is only for dots, count badges and the sheet grabber. Borders are 1 px hairlines; active tabs and nav carry a 3 px underline. Photos are clipped to aspect-locked frames (4:3 in grids, 3:2 in the gallery) with no radius of their own beyond the plate that holds them.

## Components

### Buttons
Solid and painted, never soft.
- **Shape:** 4 px corners; 44 px minimum height (sm is 36 px only from md up), 52 px for lg.
- **Band (primary):** band yellow with on-band ink, bold. One per screen.
- **Board:** ink with on-board text; the dominant action where yellow is already spent (empty-state "List your place").
- **Quiet (default):** panel white with a strong-rule border; border goes ink on hover.
- **Ghost:** ink text, sunk ground on hover. **Danger** and **danger-quiet** for destructive actions.
- **States:** hover lifts 1 px; press drops 1 px and scales to 0.98; disabled is 55% opacity. Transitions run 120 ms on the exponential ease-out. A loading button shows a spinner, keeps its label and blocks clicks.

### Inputs / Fields
- **Style:** panel white, 1 px strong-rule border, 4 px corners, 44 px high, 12 px side padding. Label bold above, hint under the label, error under the control, all wired by id.
- **Focus:** border and 2 px outline go to focus ink. On a board, fields are board-2 with a board-line border, 48 px high, and focus goes band.
- **Error / Disabled:** border and outline go danger with a bold danger message; disabled is sunk ground with ink-3 text.

### Status plates
- **Style:** soft semantic ground, strong semantic text, 2 px corners, 4 px by 8 px padding, bold step -1, icon 14 px with a 6 px gap. See Colors for the mapping.

### Availability plate
Board-type-wide caps with a dot: filled dot "Available", hollow dot "Taken". On a board it inverts (on-board ground for available, a board-line ring for taken).

### Navigation
The header is an ink bar with the wordmark (Keja on a band plate, Link in band on an ink plate) and bold links in on-board-2 that brighten on hover. Phones get Sign in plus a menu button that opens a bottom sheet with board-type links. Area tabs use a 3 px ink underline for the active tab.

### Tables
Dense admin tables: tabular figures, a sticky ink header, 8 px by 12 px cells, 1 px row rules, and a surface tint on row hover. Columns stay fixed in meaning; only values change.

### Listing plate (signature)
A listing is a matatu at the stage: an aspect-locked 4:3 photo, then the route board, an ink strip (12 px by 16 px) carrying the area and the KES fare in board type at step 2 and the availability plate, then the title (one link covering the whole plate) and a metadata row (county, type, beds, baths). Panel white, 6 px corners, 1 px hairline; on hover it rises 2 px with the Lift shadow and the photo scales to 1.03. Taken places stay in the grid on the surface ground. With no photo, the frame shows a camera-off icon and "No photo yet" in plate type on sunk ground, never a stock photo.

### Route-board search (signature)
The hero search as a full-width ink board: a destination readout in board caps (where, what, budget, with unset values muted) above area, county, type and budget fields and the band "Show places" button. When a choice changes, its readout line flips down into place. It is a plain GET form to /properties, so it works before JavaScript loads.

### Imagery
Photos come only from listers, always inside aspect-locked frames (4:3 cards, 3:2 gallery), delivered through Cloudinary transforms (`f_auto,q_auto,c_fill,w_*`) so a slow phone never downloads more than it shows. The first row loads eagerly (LCP); the rest lazily. No stock photography and no illustration: an empty frame is a designed "no photo yet" plate.

### Motion
One grammar, **pulling in**: transform and opacity only, on an exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`), at 120 / 200 / 260 ms.
- Listing plates pull in with a 14 px horizontal travel over 260 ms, staggered 40 ms per plate (capped at 8).
- The route-board readout flips each changed line down 0.35em over 260 ms.
- Dialogs rise 8 px over 200 ms; sheets slide up from the bottom over 260 ms and leave over 200 ms. No bounce.
- Nothing loops except loading skeletons and spinners, and nothing is scroll-linked. `prefers-reduced-motion` collapses every animation and transition to an instant state change.

## Do's and Don'ts

### Do:
- **Do** use band yellow only for the band, the band rule, the KNBS fact strip and one primary action per screen.
- **Do** set places, prices and headings in board type, and everything people read in Atkinson Hyperlegible Next at 16 to 17 px, max 68ch.
- **Do** put the area, the KES fare and the availability plate on the plate's ink board, in that order.
- **Do** pair every status with a label and an icon; keep taken places visible with a "Taken" plate.
- **Do** keep spacing on the 4 px grid, using 2 px only between an icon and its label.
- **Do** keep touch targets at least 44 px and the primary action in thumb reach.
- **Do** close every public section group on the dashed band rule.
- **Do** keep motion to transform and opacity on the pulling-in ease, with a still state under reduced motion.

### Don't:
- **Don't** use link blue: links and focus are ink (focus switches to band on ink panels).
- **Don't** build floating rounded photo tiles on grey with a blue button.
- **Don't** use gradients, glass, glows or ambient card shadows.
- **Don't** use corners larger than 6 px on panels, or pills on anything but dots, badges and the sheet grabber.
- **Don't** convey a status by colour alone.
- **Don't** use stock photos or illustration in place of a lister's photo.
- **Don't** set sentences in board type.
