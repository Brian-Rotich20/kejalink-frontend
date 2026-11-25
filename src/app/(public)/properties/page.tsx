import type { Metadata } from "next";
import { createLoader } from "nuqs/server";
import { Suspense } from "react";
import { PropertyPlateSkeleton } from "@/components/domain/property-plate";
import { WakingNotice } from "@/components/layout/waking";
import { searchListings } from "@/lib/api/public-data";
import { filterParsers, normaliseFilters } from "@/lib/filters";
import { formatAmount } from "@/lib/format";
import { PROPERTY_TYPE_LABEL } from "@/lib/kenya";
import { Discovery } from "./discovery";

const loadFilters = createLoader(filterParsers);

/** "Bedsitters in Kahawa Wendani under KES 10,000", for titles and link previews. */
function describe(filters: ReturnType<typeof normaliseFilters>): string {
  const what = filters.type ? `${PROPERTY_TYPE_LABEL[filters.type]}s` : "Places";
  const where = filters.area || filters.county;
  const budget = filters.maxPrice !== null ? ` under KES ${formatAmount(filters.maxPrice)}` : "";
  return `${what} to rent${where ? ` in ${where}` : ""}${budget}`;
}

export async function generateMetadata({ searchParams }: PageProps<"/properties">): Promise<Metadata> {
  const filters = normaliseFilters(loadFilters(await searchParams));
  const title = describe(filters);
  return {
    title,
    description: `${title} on KejaLink. Real listings with clear availability. Request a viewing and pay only after you've seen the house.`,
    alternates: { canonical: "/properties" },
  };
}

async function DiscoveryLoader({ searchParams }: { searchParams: PageProps<"/properties">["searchParams"] }) {
  const filters = normaliseFilters(loadFilters(await searchParams));
  let initial = null;
  try {
    initial = await searchListings(filters);
  } catch {
    // The client retries; a sleeping API shows the waking state instead of an error page.
  }
  return <Discovery initialFilters={filters} initial={initial} />;
}

function DiscoveryFallback() {
  return (
    <div className="grid gap-6 lg:grid-cols-[17.5rem_1fr] lg:gap-10">
      <div aria-hidden className="hidden h-96 rounded-md bg-surface-sunk lg:block" />
      <div className="grid content-start gap-5">
        <WakingNotice />
        <ul aria-hidden className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <PropertyPlateSkeleton />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  return (
    <div className="wrap grid gap-6 pt-8 pb-0 md:pt-12 lg:pb-16">
      <div className="grid gap-2">
        <h1 className="board-type text-step-5">Places to rent</h1>
        <p className="measure text-ink-2">
          Every listing shows its monthly rent and whether it&apos;s still free. Taken places stay on the
          board so you can see what goes fast.
        </p>
      </div>
      <Suspense fallback={<DiscoveryFallback />}>
        <DiscoveryLoader searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
