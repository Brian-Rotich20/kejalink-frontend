# Component spec sheets

These are dimensional drawings made with the `dimensional-drawing` skill. Each value was measured
from the shipped components in a browser (`e2e/measure/measure.mjs`, raw output in
`measurements.json`), not taken from the design intent.

| Sheet | Component |
|---|---|
| [property-plate.html](property-plate.html) | Listing plate (search results, home, dashboards) |
| [filter-bar.html](filter-bar.html) | Discovery filters: desktop rail, phone bar and bottom sheet |
| [booking-panel.html](booking-panel.html) | Listing request panel: desktop side column, phone bar |
| [table-row.html](table-row.html) | One dense admin table row under its sticky header |

Open the files directly in a browser. `kit.js` and `sheet.css` are shared by all four.

## What the measurements changed

Measuring the real components exposed spacing that broke the 4 px system:

- 10 px paddings on the board strips and table cells (`py-2.5`)
- 14 px on the landing band
- 10 px gaps (`gap-2.5`)
- 6 px legend margins

All were moved onto the grid: board strips and the textarea to 12, dense table cells to 8, the
band to 16, gaps to 12, legends to 8. The only remaining off-grid values are 2 px micro-steps
between an icon and its label, which DESIGN.md now documents.

## Values the team should define

- **Table column widths:** the browser's auto layout decides them, so the drawing shows them as
  REF only. Fix them (`table-layout: fixed` plus widths) if the columns must never shift between
  pages.
