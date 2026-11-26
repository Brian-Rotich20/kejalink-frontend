import { ArrowRight, CircleCheck, Clock, KeyRound, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { PropertyPlate, PropertyPlateSkeleton } from "@/components/domain/property-plate";
import { RouteBoardSearch } from "@/components/domain/route-board-search";
import { BookingStatusPlate } from "@/components/domain/status";
import { WakingNotice } from "@/components/layout/waking";
import { Button } from "@/components/ui/button";
import { getNewestListings } from "@/lib/api/public-data";

async function NewestListings() {
  await connection();
  let listings;
  try {
    listings = (await getNewestListings(6)).data;
  } catch {
    return (
      <div className="grid gap-3 rounded-md border border-line bg-surface-2 p-6">
        <p className="font-bold">We couldn&apos;t load the newest places just now.</p>
        <p className="text-ink-2">The search above still works, or try again in a minute.</p>
        <div>
          <Button asChild>
            <Link href="/properties">Browse all places</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="grid gap-4 rounded-md border border-dashed border-line-strong p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div className="grid gap-2">
          <p className="board-type text-step-3">The stage is quiet right now</p>
          <p className="measure text-ink-2">
            KejaLink is new in Nairobi and the first places are on their way. If you have a room, bedsitter or
            house to let, yours can be the first one up.
          </p>
        </div>
        <Button asChild variant="board" size="lg">
          <Link href="/register?as=tenant">List your place</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((property, index) => (
        <li key={property.id} className="grid">
          <PropertyPlate property={property} index={index} />
        </li>
      ))}
    </ul>
  );
}

function NewestFallback() {
  return (
    <div className="grid gap-4">
      <WakingNotice />
      <ul aria-hidden className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <PropertyPlateSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}

const SEEKER_STEPS = [
  {
    title: "Search by area and budget",
    body: "Pick the estate, campus or county and what you can pay. Every place shows its rent and whether it's still free.",
  },
  {
    title: "Request a viewing",
    body: "Say when you'd like to move in. Your request shows as Pending until the person listing answers.",
    plate: "PENDING" as const,
  },
  {
    title: "Get a straight answer",
    body: "Confirmed means it's yours to view, and you get their email to arrange it. Declined means move on, no ghosting.",
    plate: "CONFIRMED" as const,
  },
  {
    title: "View it, then pay",
    body: "See the house with your own eyes before any money moves. That's the rule.",
  },
];

const LISTER_STEPS = [
  {
    title: "List from your phone",
    body: "Rent, area, type and photos straight from your camera. It takes a few minutes.",
  },
  {
    title: "Requests come to you",
    body: "Each one shows who's asking, their move-in date and their message.",
  },
  {
    title: "Confirm one",
    body: "The others are declined for you, and your place shows as Taken, so nobody chases a room that's gone.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* First viewport: the promise, then the route board you can use. */}
      <section aria-labelledby="hero-title" className="wrap grid gap-5 pt-6 pb-10 md:gap-8 md:pt-14 md:pb-14">
        <div className="grid gap-4">
          <h1 id="hero-title" className="board-type text-step-6">
            Tafuta keja yako.
          </h1>
          <p className="measure text-step-1 text-ink-2">
            Real places to rent in Nairobi, listed by the people who let them. Ask for a viewing, get a
            straight yes or no, and pay nothing until you&apos;ve seen the house.
          </p>
        </div>
        <RouteBoardSearch />
      </section>

      <div className="bg-band text-on-band">
        <p className="wrap flex items-center gap-3 py-4 font-bold">
          <ShieldCheck aria-hidden className="size-5 shrink-0" />
          Pay only after you&apos;ve viewed the house. Never send money to &ldquo;hold&rdquo; a place.
        </p>
      </div>

      <section aria-labelledby="newest-title" className="wrap grid gap-6 py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="newest-title" className="board-type text-step-4">
            Just pulled in
          </h2>
          <Link href="/properties" className="link inline-flex min-h-11 items-center gap-1.5 font-bold">
            See all places
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <Suspense fallback={<NewestFallback />}>
          <NewestListings />
        </Suspense>
      </section>

      <div aria-hidden className="band-rule" />

      <section aria-labelledby="how-title" className="wrap grid gap-10 py-14 md:py-20">
        <div className="grid gap-3">
          <h2 id="how-title" className="board-type text-step-4">
            One request, one clear answer
          </h2>
          <p className="measure text-ink-2">
            No calling ten numbers from a WhatsApp group. Every request has a status, and only one person gets
            the place.
          </p>
        </div>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="grid content-start gap-5">
            <h3 className="flex items-center gap-2 text-step-1 font-bold">
              <MapPin aria-hidden className="size-5" />
              Looking for a place
            </h3>
            <ol className="grid gap-px overflow-hidden rounded-md border border-line bg-line">
              {SEEKER_STEPS.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-x-3 bg-surface-2 p-4">
                  <span aria-hidden className="board-type text-step-3 text-ink-3">
                    {i + 1}
                  </span>
                  <div className="grid gap-1.5">
                    <p className="flex flex-wrap items-center gap-2 font-bold">
                      {step.title}
                      {step.plate ? <BookingStatusPlate status={step.plate} /> : null}
                    </p>
                    <p className="text-ink-2">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid content-start gap-5">
            <h3 className="flex items-center gap-2 text-step-1 font-bold">
              <KeyRound aria-hidden className="size-5" />
              Listing a place
            </h3>
            <ol className="grid gap-px overflow-hidden rounded-md border border-line bg-line">
              {LISTER_STEPS.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-x-3 bg-surface-2 p-4">
                  <span aria-hidden className="board-type text-step-3 text-ink-3">
                    {i + 1}
                  </span>
                  <div className="grid gap-1.5">
                    <p className="font-bold">{step.title}</p>
                    <p className="text-ink-2">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/how-it-works" className="link inline-flex min-h-11 items-center gap-1.5 font-bold">
              The full rules
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="trust-title">
        {/* The figures ride the band, as a full-width fact strip, set in a sentence. */}
        <div className="bg-band text-on-band">
          <div className="wrap grid gap-3 py-10 md:py-12">
            <h2 id="trust-title" className="board-type text-step-4">
              In Kenya’s towns, most renters deal with a person, not a company
            </h2>
            <p className="measure text-step-1">
              <strong className="board-type text-step-3">78.7%</strong> of urban households in Kenya rent
              their home, and <strong className="board-type text-step-3">about 89%</strong> of urban rentals
              are let by individuals.
            </p>
            <p className="text-step--1">
              Source: Kenya National Bureau of Statistics, 2019 Kenya Population and Housing Census.
            </p>
          </div>
        </div>
        <div className="wrap grid gap-10 py-14 md:grid-cols-[1.1fr_1fr] md:gap-16 md:py-20">
          <div className="grid content-start gap-5">
            <p className="measure text-step-1 text-ink-2">
              So the person you deal with is usually just that: a person. KejaLink shows you who they are,
              keeps every listing&apos;s availability honest, and gives you a clear answer before you travel
              to view.
            </p>
          </div>
          <div className="grid content-start gap-4 self-start rounded-md border border-line bg-surface-2 p-6">
            <h3 className="flex items-center gap-2 text-step-1 font-bold">
              <ShieldCheck aria-hidden className="size-5" />
              Stay safe when renting
            </h3>
            <ul className="grid gap-3">
              {[
                "View the house in person before you pay anything.",
                "Never pay a “viewing fee” or a deposit to hold a place you haven't seen.",
                "Meet at the house, in daylight, and take a friend if you can.",
                "Get a written receipt or agreement for every payment.",
              ].map((tip) => (
                <li key={tip} className="flex gap-3">
                  <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div aria-hidden className="band-rule" />

      <section aria-labelledby="list-title" className="wrap py-14 md:py-20">
        <div className="on-board grid gap-6 rounded-md bg-board p-6 text-on-board md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div className="grid gap-3">
            <h2 id="list-title" className="board-type text-step-4">
              Got a room, bedsitter or house to let?
            </h2>
            <p className="measure text-on-board-2">
              List it from your phone in a few minutes. Requests come to you, you pick who views it, and the
              listing shows as taken the moment you confirm.
            </p>
            <p className="flex items-center gap-2 text-step--1 text-on-board-2">
              <Clock aria-hidden className="size-4" />
              Answer requests when it suits you. Your email goes only to the person you confirm.
            </p>
          </div>
          <Button asChild variant="band" size="lg">
            <Link href="/register?as=tenant">
              List your place
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
