---
version: 1
slug: "src-app-public-page-tsx"
primary_target: "src/app/(public)/page.tsx"
related_targets: []
---

# Landing (/) — surface brief (redesign: Nairobi Urban Living)

Scope: the `/` landing page. Visitor mode: Persuade. The world is pinned by the owner's brief ("Nairobi Urban Living": editorial publication; limestone/ivory, forest, charcoal, murram; Newsreader + DM Sans); see DESIGN.md.
Audience and job: a seeker on a mid-range phone finds a real, available place in a Nairobi neighbourhood they know; a lister sees that listing is simple.
Primary action: the working search (area, type, budget) that opens /properties with those filters.
Proof: real listings from the API only, grouped by their real areas with real counts; the KNBS 2019 figures, cited; the request lifecycle.
Constraints: no invented content. Production currently has zero listings, so the empty state must stand on its own. 360 px first.

## Direction contract

THESIS: The landing page is a neighbourhood guide. Real listings are gathered under the Nairobi areas they are in, each area set as an editorial section with its photographs. It refuses the generic marketplace page: a hero, a uniform card grid, then three feature cards.

OWN-WORLD:
- Limestone ground, ivory paper, warm charcoal ink.
- Newsreader display headings in sentence case and DM Sans interface text.
- Forest only for the brand, the primary action, and one forest field (the lister invitation).
- Murram for at most one editorial mark.
- Hairlines instead of boxes; photographs 4:3 with 4 px radius.
- No chips except true states.

STORY: The visitor understands that these are real places in neighbourhoods they know, each with a clear price. They believe it because the photographs and prices are the listers' own, the request has a visible lifecycle, and "pay only after you've viewed" is the rule. They then search, or open a neighbourhood.

FIRST VIEWPORT:
- Masthead header.
- At 360 px: a display H1 naming the category and the city, a one-line promise, then the search (area, type, budget, a forest Search button) set on a single ivory panel with a hairline border. The safety line sits beneath it as quiet text, not a band.
- At 1440 px: the headline and promise take the left 7 columns. The search spans the full wrap below them, as one row. The first neighbourhood section starts within the viewport's lower edge with its lead photograph visible.

FORM: The neighbourhood guide, position 4 of my ordered list (dealt lead); seed:bbfdf1b127866fd5. World pinned: seed none (pinned): "Design concept: Nairobi Urban Living ... an art-directed Kenyan property publication."

- Signature: each neighbourhood section is asymmetric. One lead listing is shown large (8 columns), with up to two more stacked beside it (4 columns). The area name is set in Newsreader with the real count of places.
- Motion grammar: none on load. Only answers to actions: button press, the phone menu and filter sheets.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
