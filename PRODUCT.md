# Product

<!-- impeccable:product-schema 1 -->

> Source: the owner's written brief (2026-11-25), used verbatim where quoted. The owner asked not to be
> interviewed, so every fact below comes from that brief or the backend code; nothing was confirmed
> in a live interview. Facts marked _(inferred)_ are my reading of the brief.

## Platform

web

## Users

KejaLink ("keja" is Sheng for house/home) is a rental marketplace for Kenya, launching in Nairobi.

- **Seekers:** students (Kenyatta University, UoN and others) and young professionals. Mobile-first,
  mid-range Android, data-conscious (3G/4G), WhatsApp-native, short attention, high scam anxiety.
  They want to find a place near campus/work, within budget, and know it is real and available.
- **Tenants** (the listing role: small landlords, caretakers, occupants releasing a unit): often not
  technical. They want to list in minutes from a phone, upload photos from the camera, answer
  requests, keep availability true.
- **Admins:** moderation, dense tables, speed over beauty (still polished).

## Product Purpose

Core promise: real listings, a clear request workflow (pending -> confirmed/rejected), availability
that stays accurate, trust you can see. Success: a seeker sends a viewing request for a real,
available place and gets a confirmed answer with a way to reach the lister.

## Positioning

The request workflow is the product: a seeker never "contacts" a ghost listing. A request is
PENDING until the lister confirms or rejects; confirming one auto-rejects the others and marks the
place unavailable, so availability is kept true by the workflow itself, not by goodwill. The
lister's email is revealed only after confirmation. _(inferred: this mechanism, not search, is what
a classifieds page or a WhatsApp group cannot copy.)_

## Operating Context

- Seekers browse on the move (matatu, campus, between classes) on mid-range Android over mobile
  data, share links on WhatsApp, and view houses physically before paying anything.
- Tenants list from the phone they took the photos with.
- The API runs on Render's free tier and can be asleep for up to ~60 s (cold start).

## Capabilities and Constraints

- Roles: SEEKER, TENANT (lister), ADMIN. Account status ACTIVE / SUSPENDED / BANNED.
- Listings: title, description, type (HOUSE, APARTMENT, ROOM, BEDSITTER, STUDIO, OTHER), monthly KES
  price, bedrooms, bathrooms, county, area, address text, amenities, availability, up to 10 photos.
  Status PUBLISHED or REJECTED (with a reason) by moderation.
- Bookings (viewing/move-in requests): PENDING, CONFIRMED, REJECTED, CANCELLED. Optional preferred
  move-in date (not before today, Africa/Nairobi) and message.
- V1 gaps that the UI must design around (no backend change): no password reset, no avatar upload,
  no phone number, no notifications.
- Terminology: the person who lists a place is a **tenant** in the data model; in UI copy they are
  "listers" or "the person listing" when "tenant" would confuse a renter. _(inferred)_

## Brand Commitments

- Name: KejaLink.
- Voice: warm, direct, street-smart, local, confident not corporate. Plain English with light
  Swahili/Sheng touches where natural ("Karibu", "Tafuta keja yako"), never forced or caricatured.
  Short sentences, concrete nouns.
- Anti-references: generic SaaS (purple/blue gradients, glassmorphism blobs, glowing cards), stock
  "smiling family" photos, Zillow/Property24 clones, emoji-bullet landing pages, dark patterns,
  cluttered ad-style listing grids, fake social proof.
- Safety is part of the brand: surface trust cues (provider name/initials, availability, "pay only
  after you've viewed the house" guidance).

## Evidence on Hand

- The only figures the UI may state: 78.7% of urban Kenyan households rent, and ~89% of urban
  rentals are let by individuals (KNBS 2019 Kenya Population and Housing Census), cited on the page.
- No logo, no photography library, no testimonials, no user counts, no partner logos. None of these
  may be invented. Listing photos come only from real listers via the API.

## Product Principles

1. Truth before polish: never show a listing, number or person that is not real.
2. The workflow is the trust: always show where a request stands and what happens next.
3. Light on data, fast on a mid-range phone: every byte must earn its place.
4. One thumb, one hand: primary actions sit where a thumb reaches.
5. Speak like a friend from the mtaa, not a bank.

## Accessibility & Inclusion

WCAG 2.2 AA minimum. Mid-range Android under outdoor light and on slow networks; 44px touch targets;
reduced motion respected everywhere.
