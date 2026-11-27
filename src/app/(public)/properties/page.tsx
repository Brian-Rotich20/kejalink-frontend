import type { Metadata } from "next";
import { createLoader } from "nuqs/server";
import { Suspense } from "react";
import { ListingRowSkeleton } from "@/components/domain/property-plate";
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
    <div className="grid flex-1 lg:grid-cols-[17.5rem_1fr] xl:grid-cols-[18.75rem_minmax(26rem,32rem)_1fr]">
      <div aria-hidden className="hidden border-r border-line bg-paper lg:block" />
      <div className="grid content-start gap-3 p-4 md:p-6">
        <WakingNotice />
        {Array.from({ length: 4 }, (_, i) => (
          <ListingRowSkeleton key={i} />
        ))}
      </div>
      <div aria-hidden className="hidden bg-sunk xl:block" />
    </div>
  );
}

/** Discovery (references R1–R3): filters, results and the map fill the window under the header. */
export default function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<DiscoveryFallback />}>
        <DiscoveryLoader searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
