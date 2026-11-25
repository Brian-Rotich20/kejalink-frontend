---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app"]
---

# Landing (/) — surface brief

Scope: `/` landing; the world also carries `/properties`, `/properties/[id]` and the auth pages. Visitor mode: Persuade.
Audience and job: a seeker (student or young professional) on a mid-range Android phone wants a real, available keja within budget near campus or work; a lister wants to list from their phone.
Primary action: the working search (area or county, type, budget) that opens /properties with those filters.
Proof on hand: real listings from the API only (currently none, so the empty state carries the page); the KNBS 2019 figures (78.7% of urban households rent; ~89% of urban rentals let by individuals), cited.
Constraints: no invented content; JS budget about 170 KB gzipped; mobile-first at 360 px.
Unresolved: no logo exists; the wordmark is set type until the owner supplies one.

## Direction contract

THESIS: KejaLink is the stage at rush hour, and every listing is a matatu that has pulled in with its route board up: where it is, what it costs, whether there is room. It refuses the category default of floating rounded photo tiles on grey with a blue button.

OWN-WORLD: Body-paint white ground and vinyl-black ink. A PSV-yellow band is committed material: full-width strips carry facts, safety lines and the primary action, and are never sprinkled as accents. Route-board plates are ink rectangles with condensed caps. The display face is Archivo at narrow width (62–75), black weight, uppercase, with tabular figures for prices. Atkinson Hyperlegible Next sets everything that is read. Corners are square-ish painted-panel radii of 2–6 px. There are no gradients and no glass.

STORY: The visitor understands that these are real places listed by real people. They believe it because a request stays PENDING until the lister confirms, the lister's contact appears only then, and "pay only after you've viewed the house" is said out loud. Then they search.

FIRST VIEWPORT: At 360 px: an ink header with the wordmark on a yellow plate, plus Sign in. Below it, a condensed-caps headline "Tafuta keja yako" with a one-line promise. Then the route board, a full-width ink panel that holds the working search: area/county, type, max budget, and a yellow "Show places" button low in thumb reach. A live destination readout repeats the choices in board caps. A yellow band bleeds edge to edge beneath it with the safety line. On desktop the board runs as one horizontal windscreen banner across the full wrap under a very large headline; there is no split hero.

FORM: Matatu livery and stage board; position 3 on my ordered list (assigned by the roll); seed:c39248723fdc2c2a.
Signature interaction: the route-board readout flips line by line as filters change, and listing plates "pull in" with a short horizontal travel on first view.
Motion grammar: horizontal travel at 180–260 ms with an exponential ease-out, transform and opacity only, no loops, and a still state under reduced motion.
Raises:
- Raised by raku (declined): yellow is reserved for the band and the one primary action per screen.
- Raised by the VHS wall (competitive): taken places stay visible with a "Taken" plate instead of vanishing.
- Raised by the cyclorama (declined): every status is text plus an icon or pattern, never colour alone.
- Raised by the fansite (declined): every public section closes on the same band rule.
- Raised by the split-flap board (competitive): dashboard tables keep fixed columns and tabular numerals; only the values change.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
