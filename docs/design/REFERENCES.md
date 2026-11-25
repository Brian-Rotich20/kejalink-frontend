# Design references

Studied on 2026-11-25 from Awwwards entry pages (and the live sites where they loaded). The aim was
to learn principles, not to borrow layouts, assets or copy. Awwwards' colour chips are auto-extracted
and no entry named its fonts, so type notes describe what is visible, not font names.

| #   | Site                                                                    | What it is                        | Award (as listed)           |
| --- | ----------------------------------------------------------------------- | --------------------------------- | --------------------------- |
| 1   | [Rialto](https://www.awwwards.com/sites/rialto)                         | Melbourne office precinct leasing | Honorable Mention, Oct 2026 |
| 2   | [ERA Residence](https://www.awwwards.com/sites/era-residence)           | 25-home development, Estepona     | Site of the Day, Aug 2026   |
| 3   | [Hubtown](https://www.awwwards.com/sites/hubtown)                       | Mumbai developer                  | Site of the Day, Jun 2026   |
| 4   | [Aardvark Book Club](https://www.awwwards.com/sites/aardvark-book-club) | Book subscription box             | Site of the Day, Aug 2026   |
| 5   | [Mira Real Estate](https://www.awwwards.com/sites/mira-real-estate)     | UAE agency with property search   | Nominee, Feb 2025           |
| 6   | [The Kenya map](https://www.awwwards.com/sites/the-kenya-map)           | 3D map of Kenya for schools       | Honorable Mention, Nov 2021 |
| 7   | [Subdivisions.com](https://www.awwwards.com/sites/subdivisions-com)     | Real-estate market data           | Nominee, Aug 2026           |

## What works, and what we take from it

**1. Rialto: one rhythm, repeated without apology.**

- _What works:_ every block is the same unit: a short caps headline, one paragraph, then one large
  image. The predictability lets the photography carry the page.
- _We take:_ one section rhythm across the public pages, with more space above a heading than below
  it. Every section closes on the same band rule.
- _We do not take:_ the eyebrow labels above headings (banned by our craft floor), the 9-field
  enquiry form, and the office-tower blue (#004BFF).

**2. ERA Residence: facts as chips, one verb.**

- _What works:_ unit cards show bedrooms and area range, then a single "Explore". Big type, a lot of
  air, photographs in day/night pairs.
- _We take:_ listing facts as short, scannable chips (beds, baths, type) with one action per card.
- _We do not take:_ the preloader, horizontal scroll, the drag-to-explore masterplan (heavy on a
  mid-range Android) and luxury restraint. KejaLink is a busy stage, not a gated resort.

**3. Hubtown: navigation by place.**

- _What works:_ regions are the navigation (tiles with a count of projects in each), and the
  floating WhatsApp contact suits a market that lives in WhatsApp.
- _We take:_ area and county as the primary way in, through the hero's route board. Share links
  are built for WhatsApp; the lister's contact appears only after a confirmed request.
- _We do not take:_ the 0–100% loader, mouse-reveal effects and per-region project counts. We will
  not show counts we do not have.

**4. Aardvark Book Club: a plain pitch, a plain "how it works".**

- _What works:_ a one-line pitch with the action right there, four clear steps, a dense wall of
  real covers, and the hard question (price) answered in plain words.
- _We take:_ "how it works" as the real request lifecycle (PENDING → CONFIRMED/REJECTED), and an
  honest answer to the scary question ("pay only after you've viewed").
- _We do not take:_ the scroll-driven 3D reveal, the jiggling CTA and the illustration style.

**5. Mira Real Estate: mobile filtering designed separately.**

- _What works:_ the entry lists "Property Selection Desktop" and "Property Selection Mobile" as
  separate designed elements.
- _We take:_ filters are a sidebar on desktop and a bottom sheet on mobile, each designed in its
  own right, with the result count kept in view.
- _We do not take:_ the luxury dark treatment. The live site did not load (expired certificate),
  so nothing visual is borrowed.

**6. The Kenya map: respect the device.**

- _What works:_ it lets the visitor choose Low / Medium / High quality before loading the 3D scene.
- _We take:_ a performance ethic of no WebGL and no heavy media, with lazy images below the fold.
  We honour reduced motion, and data-light defaults are the only mode, not a setting.
- _We do not take:_ any illustration, sprites or Three.js.

**7. Subdivisions.com: density can be beautiful.**

- _What works:_ app-style data surfaces (the "Instant Market Signals" element). The live site was
  403, so we judged from the entry only.
- _We take:_ the admin and tenant tables are dense, with fixed columns and tabular numerals.
- _We do not take:_ charts or market signals. We have no such data and will not invent it.

## Principles extracted

1. Photographs come only from real listers, so the frame around them (aspect-locked plates and
   bands) must look finished even when a listing has no photo.
2. One action per screen region; the search is the hero, not a link to it.
3. Place names are navigation, set the way Nairobi reads them: on route boards.
4. Restraint in motion: one authored moment (the board readout and plates pulling in), nothing
   looping, nothing scroll-jacked.
5. Mobile layouts are their own design, not a collapsed desktop.
