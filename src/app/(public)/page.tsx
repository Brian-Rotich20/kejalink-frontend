import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ListingSearch } from "@/components/domain/listing-search";
import { PropertyPlate, PropertyPlateSkeleton } from "@/components/domain/property-plate";
import { WakingNotice } from "@/components/layout/waking";
import { Button } from "@/components/ui/button";
import { getNewestListings } from "@/lib/api/public-data";
import type { PropertyListItem } from "@/lib/api/schemas/property";
import { plural } from "@/lib/format";

/**
 * Group the newest listings by neighbourhood: the busiest areas first, most recent breaking ties.
 * Counts are the real number of listings in this batch, never an estimate.
 */
function byNeighbourhood(listings: PropertyListItem[], maxAreas = 2, maxElsewhere = 6) {
  const keyOf = (l: PropertyListItem) => `${l.area.trim().toLowerCase()}|${l.county}`;
  const groups = new Map<string, PropertyListItem[]>();
  for (const listing of listings)
    groups.set(keyOf(listing), [...(groups.get(keyOf(listing)) ?? []), listing]);
  // A section needs at least two places; a single listing would leave the side column empty.
  const sections = [...groups.values()]
    .filter((group) => group.length >= 2)
    .sort((a, b) => b.length - a.length || (b[0]?.createdAt ?? "").localeCompare(a[0]?.createdAt ?? ""))
    .slice(0, maxAreas);
  const inSection = new Set(sections.map((group) => keyOf(group[0] as PropertyListItem)));
  const rest = listings.filter((l) => !inSection.has(keyOf(l)));
  // Whole rows of three on wide screens; the full list is one click away.
  const count = rest.length >= 3 ? Math.min(maxElsewhere, rest.length - (rest.length % 3)) : rest.length;
  const elsewhere = rest.slice(0, count);
  return { sections, elsewhere };
}

function Elsewhere({
  listings,
  first,
  titled,
}: {
  listings: PropertyListItem[];
  first: boolean;
  titled: boolean;
}) {
  if (listings.length === 0) return null;
  return (
    <section aria-labelledby="elsewhere-title" className="grid gap-6 border-t border-line pt-6 md:pt-8">
      <h3 id="elsewhere-title" className={titled ? "headline text-step-4" : "sr-only"}>
        Elsewhere in Nairobi
      </h3>
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing, i) => (
          <li key={listing.id}>
            <PropertyPlate
              property={listing}
              priority={first && i < 3}
              sizes="(min-width: 1200px) 384px, (min-width: 640px) 50vw, 100vw"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Neighbourhood({ listings, first }: { listings: PropertyListItem[]; first: boolean }) {
  const [lead, ...rest] = listings;
  if (!lead) return null;
  const area = lead.area.trim();
  const href = `/properties?area=${encodeURIComponent(area)}`;
  return (
    <section aria-labelledby={`area-${lead.id}`} className="grid gap-6 border-t border-line pt-6 md:pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 id={`area-${lead.id}`} className="headline text-step-4">
          {area}
          <span className="ml-3 font-sans text-step-0 font-normal tracking-normal text-ink-3">
            {lead.county}
          </span>
        </h3>
        <Link href={href} className="link text-step--1">
          {listings.length > 1 ? `All ${plural(listings.length, "new place")} in ${area}` : `More in ${area}`}
        </Link>
      </div>
      {rest.length === 1 ? (
        <ul className="grid gap-x-6 gap-y-10 md:grid-cols-2">
          {listings.map((listing, i) => (
            <li key={listing.id}>
              <PropertyPlate
                property={listing}
                showArea={false}
                priority={first && i === 0}
                sizes="(min-width: 1200px) 580px, (min-width: 768px) 50vw, 100vw"
              />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-x-6 gap-y-10 md:grid-cols-12">
          <li className="md:col-span-8 md:row-span-2">
            <PropertyPlate
              property={lead}
              variant="lead"
              showArea={false}
              priority={first}
              sizes="(min-width: 1200px) 760px, (min-width: 768px) 66vw, 100vw"
            />
          </li>
          {rest.slice(0, 2).map((listing) => (
            <li key={listing.id} className="md:col-span-4 md:col-start-9">
              <PropertyPlate
                property={listing}
                showArea={false}
                sizes="(min-width: 1200px) 370px, (min-width: 768px) 33vw, 100vw"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

async function Neighbourhoods() {
  await connection();
  let listings: PropertyListItem[];
  try {
    listings = (await getNewestListings(12)).data;
  } catch {
    return (
      <div className="grid justify-items-start gap-3 border-t border-line pt-6">
        <p className="font-medium">The newest places didn&apos;t load just now.</p>
        <p className="text-ink-2">The search above still works, or try again in a minute.</p>
        <Button asChild>
          <Link href="/properties">Browse all places</Link>
        </Button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="grid gap-4 border-t border-line pt-6 md:grid-cols-12 md:gap-6">
        <p className="headline text-step-3 md:col-span-7">
          KejaLink is new in Nairobi, and the first places are on their way.
        </p>
        <div className="grid content-start justify-items-start gap-4 md:col-span-5">
          <p className="text-ink-2">
            If you have a room, bedsitter or house to let, yours can be among the first. People looking in
            your area will see it the day you list it.
          </p>
          <Button asChild variant="primary">
            <Link href="/register?as=tenant">List your place</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { sections, elsewhere } = byNeighbourhood(listings);
  return (
    <div className="grid gap-12 md:gap-16">
      {sections.map((group, index) => (
        <Neighbourhood key={group[0]?.id} listings={group} first={index === 0} />
      ))}
      <Elsewhere listings={elsewhere} first={sections.length === 0} titled={sections.length > 0} />
    </div>
  );
}

function NeighbourhoodsFallback() {
  return (
    <div className="grid gap-6 border-t border-line pt-6">
      <WakingNotice />
      <div aria-hidden className="h-9 w-48 rounded-xs bg-sunk" />
      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <PropertyPlateSkeleton />
        </div>
        <div className="hidden gap-6 md:col-span-4 md:grid">
          <PropertyPlateSkeleton />
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: "Find a place",
    body: "Search by area and budget. Every listing shows its monthly rent and whether it is still free.",
  },
  {
    title: "Ask to view it",
    body: "Send a request with your move-in date. It stays pending until the person letting it answers.",
  },
  {
    title: "Get a clear answer",
    body: "Confirmed means you get their email to arrange a viewing. Declined means you can move on without waiting.",
  },
  {
    title: "View it, then pay",
    body: "See the house in person before any money changes hands. That is the rule on KejaLink.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section aria-labelledby="hero-title" className="wrap grid gap-6 pt-8 pb-10 md:gap-8 md:pt-16 md:pb-14">
        <div className="grid gap-4 md:grid-cols-12">
          <h1 id="hero-title" className="display text-step-6 md:col-span-9">
            Find a place to rent in Nairobi, from the people who let it.
          </h1>
          <p className="measure text-step-1 text-ink-2 md:col-span-7">
            Tafuta keja yako. Ask to view a place, get a straight yes or no, and pay nothing until you have
            seen the house.
          </p>
        </div>
        <ListingSearch />
      </section>

      <section aria-labelledby="new-title" className="wrap grid gap-8 pb-16 md:gap-10 md:pb-24">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id="new-title" className="headline text-step-3">
            Newest places, by neighbourhood
          </h2>
          <Link href="/properties" className="link">
            Browse all places
          </Link>
        </div>
        <Suspense fallback={<NeighbourhoodsFallback />}>
          <Neighbourhoods />
        </Suspense>
      </section>

      <section aria-labelledby="how-title" className="border-t border-line bg-paper">
        <div className="wrap grid gap-10 py-16 md:grid-cols-12 md:gap-6 md:py-24">
          <div className="grid content-start gap-3 md:col-span-4">
            <h2 id="how-title" className="headline text-step-4">
              How a request works
            </h2>
            <p className="text-ink-2">
              One request, one answer, and only one person gets the place. Nobody chases a room that has gone.
            </p>
            <Link href="/how-it-works" className="link justify-self-start">
              Read the full rules
            </Link>
          </div>
          <ol className="grid gap-8 md:col-span-7 md:col-start-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line pt-5">
                <span aria-hidden className="headline text-step-3 leading-none text-accent-text">
                  {i + 1}
                </span>
                <div className="grid gap-1">
                  <h3 className="text-step-1 font-semibold">{step.title}</h3>
                  <p className="text-ink-2">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="safety-title" className="border-t border-line">
        <div className="wrap grid gap-10 py-16 md:grid-cols-12 md:gap-6 md:py-24">
          <figure className="grid content-start gap-4 md:col-span-6">
            <blockquote>
              <p className="display text-step-4">
                78.7% of households in Kenya&apos;s towns rent their home, and about 89% of those rentals are
                let by individuals.
              </p>
            </blockquote>
            <figcaption className="text-step--1 text-ink-3">
              Kenya National Bureau of Statistics, 2019 Kenya Population and Housing Census.
            </figcaption>
          </figure>
          <div className="grid content-start gap-4 md:col-span-5 md:col-start-8">
            <h2 id="safety-title" className="headline text-step-3">
              Renting from a person, safely
            </h2>
            <p className="text-ink-2">
              Most of the time you are dealing with a landlord or a caretaker, not a company. These four rules
              protect you either way.
            </p>
            <ul className="grid gap-3">
              {[
                "View the house in person before you pay anything.",
                "Never pay a viewing fee, or a deposit to hold a place you have not seen.",
                "Meet at the house in daylight, and take a friend if you can.",
                "Pay into an account in the landlord's or agent's name, and keep the receipt.",
              ].map((rule) => (
                <li key={rule} className="border-t border-line pt-3">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="list-title" className="on-primary bg-primary text-on-primary">
        <div className="wrap grid gap-6 py-16 md:grid-cols-12 md:items-end md:gap-6 md:py-20">
          <div className="grid gap-3 md:col-span-7">
            <h2 id="list-title" className="display text-step-5">
              Letting a room, a bedsitter or a house?
            </h2>
            <p className="measure text-on-primary-2">
              List it from your phone in a few minutes. Requests come to you, you choose who views it, and
              your email is shared only with the person you confirm.
            </p>
          </div>
          <div className="md:col-span-4 md:col-start-9 md:justify-self-end">
            <Button asChild size="lg" className="border-0 bg-paper text-primary hover:bg-ground">
              <Link href="/register?as=tenant">List your place</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
