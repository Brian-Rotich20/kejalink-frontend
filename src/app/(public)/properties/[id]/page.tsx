import { Bath, BedDouble, CalendarDays, Home, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { bedsLabel } from "@/components/domain/property-plate";
import { AvailabilityPlate, PropertyStatusPlate } from "@/components/domain/status";
import { WakingNotice } from "@/components/layout/waking";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StateBlock } from "@/components/ui/state";
import { isApiError } from "@/lib/api/errors";
import { getPublicProperty, isUuid } from "@/lib/api/public-data";
import { propertyDetail, type PropertyDetail } from "@/lib/api/schemas/property";
import { authedGet, getServerSession } from "@/lib/api/server";
import { siteUrl } from "@/lib/env/public";
import { formatDate, formatKes } from "@/lib/format";
import { PROPERTY_TYPE_LABEL } from "@/lib/kenya";
import { BookingPanel, SafetyTips } from "./booking-panel";
import { Gallery } from "./gallery";

/**
 * Public listing first (cached); if that 404s and someone is signed in, try as them: owners see
 * their declined listings and admins see everything.
 */
async function loadProperty(
  id: string,
): Promise<{ property: PropertyDetail; isPublic: boolean } | "not-found"> {
  if (!isUuid(id)) return "not-found";
  const publicListing = await getPublicProperty(id);
  if (publicListing) return { property: publicListing, isPublic: true };
  if (!(await getServerSession())) return "not-found";
  try {
    return { property: (await authedGet(`/properties/${id}`, propertyDetail)).data, isPublic: false };
  } catch (error) {
    if (isApiError(error) && error.status === 404) return "not-found";
    throw error;
  }
}

const headline = (p: PropertyDetail) => `${PROPERTY_TYPE_LABEL[p.propertyType]} in ${p.area}, ${p.county}`;

export async function generateMetadata({ params }: PageProps<"/properties/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) return { title: "Place not found" };
  try {
    const p = await getPublicProperty(id);
    if (!p) return { title: "Place not found", robots: { index: false } };
    const title = `${p.title} · ${formatKes(p.priceAmount)}/month`;
    const description = `${headline(p)}. ${formatKes(p.priceAmount)} a month${p.isAvailable ? "" : " (currently taken)"}. ${p.description.slice(0, 140)}`;
    return {
      title,
      description,
      alternates: { canonical: `/properties/${p.id}` },
      openGraph: { title, description, type: "website", url: `/properties/${p.id}` },
    };
  } catch {
    return { title: "Place to rent", robots: { index: false } };
  }
}

/** Only facts the API returns. */
function JsonLd({ p }: { p: PropertyDetail }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    name: p.title,
    description: p.description,
    url: `${siteUrl}/properties/${p.id}`,
    image: p.uploads.map((u) => u.url),
    address: {
      "@type": "PostalAddress",
      addressLocality: p.area,
      addressRegion: p.county,
      addressCountry: "KE",
    },
    ...(p.bedrooms !== null ? { numberOfBedrooms: p.bedrooms } : {}),
    ...(p.bathrooms !== null ? { numberOfBathroomsTotal: p.bathrooms } : {}),
    amenityFeature: p.amenities.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
    offers: {
      "@type": "Offer",
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
      availability: p.isAvailable ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: p.priceAmount,
        priceCurrency: p.priceCurrency,
        unitCode: "MON",
      },
    },
  };
  // `<` is escaped so listing text can never close the script tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

async function PropertyView({ params }: { params: PageProps<"/properties/[id]">["params"] }) {
  const { id } = await params;
  let result;
  try {
    result = await loadProperty(id);
  } catch {
    return (
      <div className="wrap py-12">
        <StateBlock
          title="This place didn't load"
          action={
            <Button asChild variant="board">
              <Link href={`/properties/${id}`}>Try again</Link>
            </Button>
          }
        >
          <p>The server may be waking up after a quiet spell. Give it a moment and try again.</p>
        </StateBlock>
      </div>
    );
  }
  if (result === "not-found") notFound();
  const { property: p, isPublic } = result;
  const beds = bedsLabel(p.bedrooms, p.propertyType);

  return (
    <article className="wrap grid gap-8 pt-6 pb-32 lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:gap-12 lg:pt-10 lg:pb-20">
      {isPublic ? <JsonLd p={p} /> : null}
      <div className="grid min-w-0 content-start gap-8">
        <nav aria-label="Breadcrumb" className="text-step--1 text-ink-2">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link className="link" href="/properties">
                Places
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link className="link" href={`/properties?county=${encodeURIComponent(p.county)}`}>
                {p.county}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="truncate">
              {p.area}
            </li>
          </ol>
        </nav>

        {!isPublic ? (
          <div role="note" className="grid gap-1 rounded-sm border border-danger/40 bg-danger-soft p-4">
            <p className="flex items-center gap-2 font-bold text-danger">
              <PropertyStatusPlate status={p.status} />
              {p.deletedAt ? "Deleted listing" : "Not visible to the public"}
            </p>
            {p.rejectionReason ? <p className="text-ink-2">Reason: {p.rejectionReason}</p> : null}
          </div>
        ) : null}

        <Gallery images={p.uploads} title={p.title} />

        <header className="grid gap-4">
          <div className="on-board flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-sm bg-board px-4 py-3 text-on-board">
            <p className="board-type flex items-center gap-2 text-step-4">
              <MapPin aria-hidden className="size-6 text-band" />
              {p.area}
            </p>
            <p className="text-on-board-2">{p.county} County</p>
          </div>
          <h1 className="text-step-3 leading-tight font-bold">{p.title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <AvailabilityPlate available={p.isAvailable} />
            <p className="board-type text-step-3 lg:hidden">
              {formatKes(p.priceAmount)}{" "}
              <span className="font-sans text-step-0 font-normal text-ink-3 normal-case">/ month</span>
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
            {[
              { icon: Home, label: "Type", value: PROPERTY_TYPE_LABEL[p.propertyType] },
              {
                icon: BedDouble,
                label: "Bedrooms",
                value: beds ?? (p.bedrooms === 0 ? "None (one room)" : "Not given"),
              },
              {
                icon: Bath,
                label: "Bathrooms",
                value: p.bathrooms === null ? "Not given" : String(p.bathrooms),
              },
              { icon: CalendarDays, label: "Listed", value: formatDate(p.createdAt) },
            ].map(({ icon: Icon, label, value }) => (
              <li key={label} className="grid gap-1 bg-surface-2 p-3">
                <span className="flex items-center gap-1.5 text-step--1 text-ink-3">
                  <Icon aria-hidden className="size-4" />
                  {label}
                </span>
                <span className="font-bold">{value}</span>
              </li>
            ))}
          </ul>
          {p.addressText ? (
            <p className="flex items-start gap-2 text-ink-2">
              <MapPin aria-hidden className="mt-1 size-4 shrink-0" />
              {p.addressText}
            </p>
          ) : null}
        </header>

        <section aria-labelledby="about-title" className="grid gap-3">
          <h2 id="about-title" className="board-type text-step-3">
            About this place
          </h2>
          <p className="measure whitespace-pre-line">{p.description}</p>
        </section>

        {p.amenities.length > 0 ? (
          <section aria-labelledby="amenities-title" className="grid gap-3">
            <h2 id="amenities-title" className="board-type text-step-3">
              What&apos;s here
            </h2>
            <ul className="flex flex-wrap gap-2">
              {p.amenities.map((a) => (
                <li
                  key={a}
                  className="rounded-sm border border-line-strong bg-surface-2 px-3 py-1.5 font-bold"
                >
                  {a}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          aria-labelledby="lister-title"
          className="flex items-center gap-4 rounded-md border border-line bg-surface-2 p-5"
        >
          <Avatar name={p.tenant.name} size="lg" />
          <div className="grid gap-1">
            <h2 id="lister-title" className="font-bold">
              Listed by {p.tenant.name}
            </h2>
            <p className="text-step--1 text-ink-2">
              Their email is shared with you once they confirm your request.
            </p>
          </div>
        </section>

        <div className="lg:hidden">
          <SafetyTips />
        </div>

        <p>
          <Link className="link font-bold" href={`/properties?area=${encodeURIComponent(p.area)}`}>
            More places in {p.area}
          </Link>
        </p>
      </div>

      <aside className="grid content-start gap-5 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <BookingPanel
          propertyId={p.id}
          tenantId={p.tenantId}
          isAvailable={p.isAvailable && p.status === "PUBLISHED" && !p.deletedAt}
          priceAmount={p.priceAmount}
          area={p.area}
        />
        <div className="hidden lg:block">
          <SafetyTips />
        </div>
      </aside>
    </article>
  );
}

function DetailFallback() {
  return (
    <div className="wrap grid gap-8 pt-6 pb-20 lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:gap-12 lg:pt-10">
      <div className="grid content-start gap-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="aspect-[3/2] w-full rounded-md" />
        <WakingNotice />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="hidden h-80 rounded-md lg:block" />
    </div>
  );
}

export default function PropertyPage({ params }: PageProps<"/properties/[id]">) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <PropertyView params={params} />
    </Suspense>
  );
}
