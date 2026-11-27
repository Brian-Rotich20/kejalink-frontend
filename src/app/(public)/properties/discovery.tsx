"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AlertTriangle, LayoutGrid, List, Map as MapIcon, RotateCcw, SearchX, SlidersHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import { useQueryStates } from "nuqs";
import { useRef, useState } from "react";
import { z } from "zod";
import {
  ListingRow,
  ListingRowSkeleton,
  PropertyPlate,
  PropertyPlateSkeleton,
} from "@/components/domain/property-plate";
import { WakingNotice } from "@/components/layout/waking";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { StateBlock } from "@/components/ui/state";
import { apiFetch } from "@/lib/api/client";
import type { Envelope } from "@/lib/api/envelope";
import { messageFor } from "@/lib/api/errors";
import { type PropertyListItem, propertyListItem } from "@/lib/api/schemas/property";
import { cn } from "@/lib/cn";
import {
  activeFilterCount,
  EMPTY_FILTERS,
  type Filters,
  filterParsers,
  normaliseFilters,
  PAGE_SIZE,
  SORT_LABEL,
  SORTS,
  type Sort,
  toApiQuery,
  type View,
} from "@/lib/filters";
import { formatAmount, plural } from "@/lib/format";
import { PROPERTY_TYPE_LABEL } from "@/lib/kenya";
import { FilterPanel } from "./filter-panel";
import type { Bounds } from "./listing-map";

const ListingMap = dynamic(() => import("./listing-map"), {
  ssr: false,
  loading: () => <div aria-hidden className="size-full animate-[skeleton_1.6s_var(--ease-in-out)_infinite] bg-sunk" />,
});

type Listings = Envelope<PropertyListItem[]>;

const listingsSchema = z.array(propertyListItem);

const sameFilters = (a: Filters, b: Filters) => JSON.stringify(a) === JSON.stringify(b);

/** The view is not part of the query: switching views never refetches. */
const queryFilters = (f: Filters): Filters => ({ ...f, view: "map" });

function useDiscoveryQuery(filters: Filters, initial: { filters: Filters; data: Listings | null }) {
  const key = queryFilters(filters);
  return useQuery({
    queryKey: ["properties", "search", key],
    queryFn: ({ signal }) =>
      apiFetch("/properties", { schema: listingsSchema, query: toApiQuery(key, PAGE_SIZE), signal }),
    placeholderData: keepPreviousData,
    initialData: initial.data && sameFilters(key, queryFilters(initial.filters)) ? initial.data : undefined,
    staleTime: 30_000,
  });
}

/** "Places to rent in Kilimani", "Bedsitters to rent": the page's h1 (reference R2 title). */
export function describeFilters(filters: Filters): string {
  const what = filters.type ? `${PROPERTY_TYPE_LABEL[filters.type]}s` : "Places";
  const where = filters.area || filters.county;
  return `${what} to rent${where ? ` in ${where}` : ""}`;
}

const boundsOf = (f: Filters): Bounds | null =>
  f.north !== null && f.south !== null && f.east !== null && f.west !== null
    ? { north: f.north, south: f.south, east: f.east, west: f.west }
    : null;

/** R2 filter pill: white, orange outline and text once something is chosen. */
function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-pill border px-4 text-step--1 font-medium whitespace-nowrap transition-colors [&_svg]:size-4",
        active ? "border-accent bg-paper text-accent-text" : "border-line bg-paper text-ink hover:border-line-strong",
      )}
    >
      {children}
    </button>
  );
}

/** R3 view toggle: square icon buttons, the active one solid green. */
function ViewToggle({ view, onView }: { view: View; onView: (v: View) => void }) {
  const items: { v: View; label: string; Icon: typeof LayoutGrid }[] = [
    { v: "map", label: "List and map", Icon: MapIcon },
    { v: "grid", label: "Grid", Icon: LayoutGrid },
  ];
  return (
    <div role="group" aria-label="View" className="flex gap-1.5">
      {items.map(({ v, label, Icon }) => (
        <button
          key={v}
          type="button"
          aria-pressed={view === v}
          aria-label={label}
          title={label}
          onClick={() => onView(v)}
          className={cn(
            "grid size-10 place-items-center rounded-md border transition-colors [&_svg]:size-4.5",
            view === v
              ? "border-primary bg-primary text-on-primary"
              : "border-line bg-paper text-ink-2 hover:border-line-strong",
          )}
        >
          <Icon aria-hidden />
        </button>
      ))}
    </div>
  );
}

function SortSelect({ sort, onSort }: { sort: Sort; onSort: (s: Sort) => void }) {
  return (
    <label className="flex min-h-10 items-center gap-1 rounded-md border border-line bg-paper pl-3 text-step--2 text-ink-3">
      Sort by:
      <select
        aria-label="Sort by"
        value={sort}
        onChange={(e) => onSort(e.target.value as Sort)}
        className="min-h-10 cursor-pointer appearance-none rounded-md bg-transparent bg-[url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231f2427' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E&quot;)] bg-[length:0.8rem] bg-[right_0.6rem_center] bg-no-repeat pr-8 pl-0.5 font-semibold text-ink outline-none focus-visible:outline-2 focus-visible:outline-focus"
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {SORT_LABEL[s]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Discovery({ initialFilters, initial }: { initialFilters: Filters; initial: Listings | null }) {
  const [raw, setRaw] = useQueryStates(filterParsers, { history: "push", scroll: false });
  const filters = normaliseFilters(raw);
  const query = useDiscoveryQuery(filters, { filters: initialFilters, data: initial });
  const listRef = useRef<HTMLDivElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  // The pill that opened the sheet gets focus back when it closes.
  const opener = useRef<HTMLElement | null>(null);
  const openSheet = (event: React.MouseEvent<HTMLElement>) => {
    opener.current = event.currentTarget;
    setSheetOpen(true);
  };
  const [phoneMap, setPhoneMap] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchAsMove, setSearchAsMove] = useState(boundsOf(filters) !== null);

  const set = (patch: Partial<Filters>) =>
    void setRaw({ ...patch, page: "page" in patch ? (patch.page ?? null) : null });
  const reset = () =>
    void setRaw({ ...EMPTY_FILTERS, sort: filters.sort, view: filters.view, page: null });

  const total = query.data?.meta?.total ?? 0;
  const totalPages = query.data?.meta?.totalPages ?? 1;
  const active = activeFilterCount(filters);
  const listings = query.data?.data ?? [];
  const refreshing = query.isFetching && query.isPlaceholderData;
  const view = filters.view;
  const countText = query.data ? `${formatAmount(total)} ${total === 1 ? "listing" : "listings"}` : "Loading places";

  const goToPage = (page: number) => {
    set({ page });
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    listRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const map = (
    <ListingMap
      listings={listings}
      selectedId={selectedId}
      highlightId={hoveredId}
      onSelect={setSelectedId}
      bounds={boundsOf(filters)}
      searchAsMove={searchAsMove}
      onSearchAsMove={(on) => {
        setSearchAsMove(on);
        if (!on) set({ north: null, south: null, east: null, west: null });
      }}
      onBounds={(b) => void setRaw({ ...b, page: null }, { history: "replace" })}
      className="size-full"
    />
  );

  const results = query.isPending ? (
    <div className="grid gap-3">
      <WakingNotice />
      <ul aria-hidden className={cn("grid gap-3", view === "grid" && "gap-4 sm:grid-cols-2 xl:grid-cols-3")}>
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i}>{view === "grid" ? <PropertyPlateSkeleton /> : <ListingRowSkeleton />}</li>
        ))}
      </ul>
    </div>
  ) : query.isError && !query.data ? (
    <StateBlock
      icon={AlertTriangle}
      tone="warning"
      title="Places didn't load"
      action={
        <Button onClick={() => void query.refetch()} loading={query.isFetching}>
          <RotateCcw aria-hidden />
          Try again
        </Button>
      }
    >
      <p>{messageFor(query.error)}</p>
    </StateBlock>
  ) : listings.length === 0 ? (
    <StateBlock
      icon={SearchX}
      title={active > 0 ? "No places match these filters" : "No places listed yet"}
      action={
        active > 0 ? (
          <Button variant="primary" onClick={reset}>
            Reset filters
          </Button>
        ) : undefined
      }
    >
      <p>
        {active > 0
          ? "Try a wider budget, a nearby area or any type. New places come in all the time."
          : "KejaLink is new and the first places are on their way. Check back soon."}
      </p>
    </StateBlock>
  ) : (
    <>
      {refreshing ? <WakingNotice /> : null}
      <ul
        aria-busy={refreshing}
        className={cn(
          "grid transition-opacity duration-(--dur-2)",
          view === "grid" ? "gap-4 sm:grid-cols-2 xl:grid-cols-3" : "gap-2.5",
          refreshing && "opacity-60",
        )}
      >
        {listings.map((property, index) => (
          <li key={property.id} className="grid">
            {view === "grid" ? (
              <PropertyPlate
                property={property}
                priority={index < 3 && filters.page === 1}
                headingLevel="h2"
              />
            ) : (
              <ListingRow
                property={property}
                priority={index < 2 && filters.page === 1}
                selected={property.id === selectedId}
                onHover={setHoveredId}
              />
            )}
          </li>
        ))}
      </ul>
      <Pagination page={filters.page} totalPages={totalPages} onPage={goToPage} disabled={query.isFetching} />
    </>
  );

  const header = (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="grid gap-0.5">
          <h1 className="headline text-step-2 md:text-step-3">{describeFilters(filters)}</h1>
          <p role="status" aria-live="polite" className="text-step--2 text-ink-3">
            {countText}
            {filters.q ? <> matching &ldquo;{filters.q}&rdquo;</> : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SortSelect sort={filters.sort} onSort={(sort) => set({ sort })} />
          <div className="hidden lg:block">
            <ViewToggle view={view} onView={(v) => void setRaw({ view: v })} />
          </div>
        </div>
      </div>

      {/* Phones and tablets: R2 filter pills; each opens the full filter sheet. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden [scrollbar-width:none]">
        <Pill active={active > 0} onClick={openSheet}>
          <SlidersHorizontal aria-hidden />
          Filters{active > 0 ? ` (${active})` : ""}
        </Pill>
        <Pill active={filters.type !== null} onClick={openSheet}>
          {filters.type ? PROPERTY_TYPE_LABEL[filters.type] : "Type"}
        </Pill>
        <Pill active={filters.minPrice !== null || filters.maxPrice !== null} onClick={openSheet}>
          {filters.maxPrice !== null ? `Up to KES ${formatAmount(filters.maxPrice)}` : "Price"}
        </Pill>
        <Pill active={filters.bedrooms !== null} onClick={openSheet}>
          {filters.bedrooms !== null ? `${filters.bedrooms}+ bedrooms` : "Bedrooms"}
        </Pill>
        <Pill active={filters.amenities.length > 0} onClick={openSheet}>
          {filters.amenities.length > 0 ? plural(filters.amenities.length, "convenience") : "More filters"}
        </Pill>
      </div>
    </div>
  );

  const filterColumn = (
    <aside
      aria-labelledby="filters-title"
      className="hidden border-r border-line bg-paper lg:block lg:overflow-y-auto"
    >
      <div className="grid gap-5 p-6">
        <div className="flex items-center justify-between">
          <h2 id="filters-title" className="text-step-0 font-bold">
            Filters
          </h2>
          {active > 0 ? (
            <button type="button" onClick={reset} className="link text-step--2">
              Reset filters
            </button>
          ) : null}
        </div>
        <FilterPanel filters={filters} set={set} />
      </div>
    </aside>
  );

  const sheet = (
    <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
      <DialogContent
        variant="sheet"
        title="Filters"
        description={countText}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener.current?.focus();
        }}
      >
        <FilterPanel filters={filters} set={set} />
        <div className="sticky bottom-0 -mx-5 mt-6 flex gap-3 border-t border-line bg-paper px-5 pt-4">
          {active > 0 ? (
            <Button variant="ghost" onClick={reset}>
              Reset
            </Button>
          ) : null}
          <Button variant="primary" block onClick={() => setSheetOpen(false)}>
            {query.data ? `Show ${plural(total, "place")}` : "Show places"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (view === "grid") {
    return (
      <div className="grid flex-1 lg:grid-cols-[17.5rem_1fr]">
        {filterColumn}
        <section ref={listRef} aria-label="Results" className="grid min-w-0 scroll-mt-20 content-start gap-5 p-4 md:p-6">
          {header}
          {results}
        </section>
        {sheet}
      </div>
    );
  }

  return (
    <div className="grid flex-1 lg:h-[calc(100dvh-var(--header-h))] lg:flex-none lg:grid-cols-[17.5rem_1fr] lg:grid-rows-[minmax(0,1fr)] xl:grid-cols-[18.75rem_minmax(26rem,32rem)_1fr]">
      {filterColumn}
      <section
        ref={listRef}
        aria-label="Results"
        className={cn(
          "grid min-w-0 scroll-mt-20 content-start gap-4 p-4 md:p-6 lg:overflow-y-auto xl:px-5",
          phoneMap && "max-xl:hidden",
        )}
      >
        {header}
        {results}
      </section>
      <div
        className={cn(
          "xl:block",
          phoneMap ? "h-[calc(100dvh-var(--header-h))] lg:h-auto" : "hidden",
        )}
      >
        {map}
      </div>

      {/* Below 1280px the map replaces the list; one floating switch toggles them. */}
      <div className="pointer-events-none sticky bottom-4 z-30 flex justify-center pb-[env(safe-area-inset-bottom)] lg:fixed lg:inset-x-0 xl:hidden">
        <Button
          variant="primary"
          className="pointer-events-auto rounded-pill px-5 shadow-2"
          onClick={() => setPhoneMap((v) => !v)}
        >
          {phoneMap ? <List aria-hidden /> : <MapIcon aria-hidden />}
          {phoneMap ? "Show list" : "Show map"}
        </Button>
      </div>
      {sheet}
    </div>
  );
}
