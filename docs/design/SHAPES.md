# Screen shapes

These are Impeccable `shape` briefs, one per major screen, written before building. The owner asked
not to be interviewed, so each brief's assumptions come from the product brief and are marked as such.
The visual world is fixed by DESIGN.md (the stage board).

## `/` Landing (Persuade)

- **Job:** a seeker on a phone decides, in one viewport, that this is where Nairobi rentals are real,
  and starts a search. A lister sees that listing is free and quick.
- **Proof:** the request lifecycle (Pending → Confirmed / Declined), the "pay only after viewing"
  rule, and the KNBS 2019 figures (78.7% of urban households rent; ~89% of urban rentals are let by
  individuals), cited. Newest listings come from the API, with an honest empty state ("the stage is
  quiet") while there are none.
- **Sequence:**
  1. Route-board hero with a working search.
  2. Band with the safety line.
  3. "Just pulled in": newest listings.
  4. How it works, as two lanes (looking / listing).
  5. Trust and the figures.
  6. Lister CTA.
  7. Footer.
- **States:** listings loading (plates, with a waking notice after 4 s), empty, API down (calm
  message plus a working search).
- **Assumption:** no logo, photography or testimonials exist; none are invented.

## `/properties` Discovery (Operate, with the world's skin)

- **Job:** narrow down to a few real, available places within budget; share the URL on WhatsApp.
- **Layout:** filters as a left rail at ≥ 1024 px and a bottom sheet on phones (sticky "Filters" +
  count bar in thumb reach). Sort, then the result count, then the plate grid (1 / 2 / 3 columns),
  then pagination.
- **States:** loading (skeleton plates; the previous results stay visible while refetching), empty
  (with "clear filters"), API error, waking, page out of range.
- **Rules:** every filter lives in the URL; search is debounced at 400 ms; taken places stay visible
  with a "Taken" plate unless `available=true` is set.

## `/properties/[id]` Detail (Persuade → Operate)

- **Job:** decide whether this place is real and right, then request a viewing.
- **Order:** gallery, then price, route-board area and facts, then the booking panel. The panel is
  sticky at the bottom on phones and a side column on desktop. Then description, amenities, the
  lister card (initials avatar), safety tips, and a "more in this area" link.
- **Panel states:**
  - signed out → sign in to request (returns here);
  - seeker → form (move-in date, message) with success / duplicate / unavailable outcomes;
  - the lister viewing their own place → "Manage this listing";
  - admin → read-only note;
  - taken → explanation plus "find similar".
- **SEO:** server-rendered; metadata, an OG image per listing, JSON-LD (`Residence` / `Offer`) limited
  to facts the API returns.

## Auth: `/login`, `/register`

- **Register:** the role comes first as two large cards ("I'm looking for a place" / "I want to list
  a place"), then a short form (name, email, password). The role choice lives in the URL
  (`?as=tenant`), so lister CTAs can deep-link.
- **Login:** email and password, `?next=` honoured (same-site paths only). There is no "forgot
  password" (V1 has no reset); a support link replaces it.
- **States:** inline field errors, rate-limited (429), suspended (403), network, already signed in.

## Seeker area (Operate)

- **Overview:** pending and confirmed counts (from `meta.total`), the latest requests, a "find a place" CTA.
- **Requests:** status tabs plus a list. **Request detail:** timeline, property summary, cancel
  (with confirm). When confirmed, it shows the lister's email (Copy / Email) and the safety rules.
- **Account:** edit name only; email read-only; no avatar URL.

## Tenant (lister) area (Operate)

- **Overview:** listing count, pending requests badge, quick actions.
- **Listings:**
  - plates with moderation status, an availability toggle, the rejection reason banner, edit, and
    delete (with a confirm that names the consequences);
  - a create / edit form in sections, with a sessionStorage draft and a preview;
  - a photo manager with compress, upload, retry, primary, reorder and delete.
- **Requests received:** status tabs; Confirm (explains auto-reject and that the place goes
  unavailable) and Decline with an optional reason.

## Admin (Operate, dense)

- Users, listings and requests as dense tables with sticky headers, filters in the URL and
  keyboard-reachable actions.
- Suspend, ban, reactivate, decline a listing (reason required), restore and delete, each confirmed
  and stating its consequences. The admin cannot act on themselves or on other admins.
