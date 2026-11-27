import { CalendarCheck, Eye, MessageSquareReply, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ListingSearch } from "@/components/domain/listing-search";
import { PropertyPlate, PropertyPlateSkeleton } from "@/components/domain/property-plate";
import { WakingNotice } from "@/components/layout/waking";
import { Button } from "@/components/ui/button";
import { getNewestListings } from "@/lib/api/public-data";
import type { PropertyListItem } from "@/lib/api/schemas/property";

/** Whole rows of three on wide screens (reference R3 grid); the full list is one click away. */
const wholeRows = (listings: PropertyListItem[], max = 6) =>
  listings.length >= 3 ? listings.slice(0, Math.min(max, listings.length - (listings.length % 3))) : listings;

async function NewestPlaces() {
  await connection();
  let listings: PropertyListItem[];
  try {
    listings = (await getNewestListings(6)).data;
  } catch {
    return (
      <div className="grid justify-items-start gap-3 rounded-md border border-line bg-paper p-6">
        <p className="font-semibold">The newest places didn&apos;t load just now.</p>
        <p className="text-ink-2">The search above still works, or try again in a minute.</p>
        <Button asChild>
          <Link href="/properties">Browse all places</Link>
        </Button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="grid gap-4 rounded-md border border-line bg-paper p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div className="grid gap-1">
          <p className="text-step-1 font-bold">KejaLink is new in Nairobi, and the first places are on their way.</p>
          <p className="text-ink-2">
            If you have a room, bedsitter or house to let, yours can be among the first. People looking in your area
            will see it the day you list it.
          </p>
        </div>
        <Button asChild variant="primary" className="justify-self-start">
          <Link href="/register?as=tenant">List your place</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {wholeRows(listings).map((listing, i) => (
        <li key={listing.id} className="grid">
          <PropertyPlate
            property={listing}
            priority={i < 3}
            sizes="(min-width: 1280px) 400px, (min-width: 640px) 45vw, 100vw"
          />
        </li>
      ))}
    </ul>
  );
}

function NewestFallback() {
  return (
    <div className="grid gap-4">
      <WakingNotice />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <PropertyPlateSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

const STEPS = [
  {
    Icon: Search,
    title: "Find a place",
    body: "Search by area and budget. Every listing shows its monthly rent and whether it is still free.",
  },
  {
    Icon: CalendarCheck,
    title: "Ask to view it",
    body: "Send a request with your move-in date. It stays pending until the person letting it answers.",
  },
  {
    Icon: MessageSquareReply,
    title: "Get a clear answer",
    body: "Confirmed means you get their email to arrange a viewing. Declined means you can move on.",
  },
  {
    Icon: Eye,
    title: "View it, then pay",
    body: "See the house in person before any money changes hands. That is the rule on KejaLink.",
  },
];

const RULES = [
  "View the house in person before you pay anything.",
  "Never pay a viewing fee, or a deposit to hold a place you have not seen.",
  "Meet at the house in daylight, and take a friend if you can.",
  "Pay into an account in the landlord's or agent's name, and keep the receipt.",
];

export default function LandingPage() {
  return (
    <>
      <section aria-labelledby="hero-title" className="border-b border-line bg-paper">
        <div className="wrap grid gap-6 py-10 md:gap-8 md:py-16">
          <div className="grid max-w-3xl gap-3">
            <h1 id="hero-title" className="display text-step-6">
              Find a place to rent in Nairobi, from the people who let it.
            </h1>
            <p className="measure text-step-1 text-ink-2">
              Tafuta keja yako. Ask to view a place, get a straight yes or no, and pay nothing until you have seen
              the house.
            </p>
          </div>
          <ListingSearch />
        </div>
      </section>

      <section aria-labelledby="new-title" className="wrap grid gap-5 py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div className="grid gap-0.5">
            <h2 id="new-title" className="headline text-step-3">
              Newest places
            </h2>
            <p className="text-step--1 text-ink-3">Listed by the people who let them, newest first.</p>
          </div>
          <Link href="/properties" className="link text-step--1">
            Browse all places
          </Link>
        </div>
        <Suspense fallback={<NewestFallback />}>
          <NewestPlaces />
        </Suspense>
      </section>

      <section aria-labelledby="how-title" className="border-y border-line bg-paper">
        <div className="wrap grid gap-8 py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div className="grid gap-0.5">
              <h2 id="how-title" className="headline text-step-3">
                How a request works
              </h2>
              <p className="text-step--1 text-ink-3">One request, one answer, and only one person gets the place.</p>
            </div>
            <Link href="/how-it-works" className="link text-step--1">
              Read the full rules
            </Link>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ Icon, title, body }, i) => (
              <li key={title} className="grid content-start gap-3 rounded-md border border-line bg-ground p-5">
                <span className="grid size-10 place-items-center rounded-md bg-primary-soft text-primary">
                  <Icon aria-hidden className="size-5" />
                </span>
                <div className="grid gap-1">
                  <h3 className="font-bold">
                    <span className="text-ink-3">{i + 1}.</span> {title}
                  </h3>
                  <p className="text-step--1 text-ink-2">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="safety-title" className="wrap grid gap-6 py-12 md:grid-cols-2 md:gap-8 md:py-16">
        <div className="grid content-start gap-3">
          <h2 id="safety-title" className="headline text-step-3">
            Renting from a person, safely
          </h2>
          <p className="text-ink-2">
            Most of the time you are dealing with a landlord or a caretaker, not a company. In Kenya&apos;s towns,
            78.7% of households rent their home, and about 89% of those rentals are let by individuals.
          </p>
          <p className="text-step--2 text-ink-3">
            Kenya National Bureau of Statistics, 2019 Kenya Population and Housing Census.
          </p>
        </div>
        <ul className="grid gap-2 rounded-md border border-line bg-paper p-3">
          {RULES.map((rule) => (
            <li key={rule} className="flex items-start gap-3 rounded-sm p-2">
              <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
              {rule}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="list-title" className="on-primary bg-primary text-on-primary">
        <div className="wrap grid gap-6 py-12 md:grid-cols-[1fr_auto] md:items-center md:py-14">
          <div className="grid gap-2">
            <h2 id="list-title" className="headline text-step-3">
              Letting a room, a bedsitter or a house?
            </h2>
            <p className="measure text-on-primary-2">
              List it from your phone in a few minutes. Requests come to you, you choose who views it, and your email
              is shared only with the person you confirm.
            </p>
          </div>
          <Button asChild size="lg" className="justify-self-start border-0 bg-paper text-primary-text hover:bg-primary-soft">
            <Link href="/register?as=tenant">List your place</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
