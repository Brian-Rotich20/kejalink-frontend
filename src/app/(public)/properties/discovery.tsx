"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AlertTriangle, RotateCcw, SearchX, SlidersHorizontal } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useId, useRef, useState } from "react";
import { z } from "zod";
import { PropertyPlate, PropertyPlateSkeleton } from "@/components/domain/property-plate";
import { WakingNotice } from "@/components/layout/waking";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { controlClass, NativeSelect } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { StateBlock } from "@/components/ui/state";
import { useDebouncedCallback } from "@/hooks/use-debounced";
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
} from "@/lib/filters";
import { formatAmount, plural } from "@/lib/format";
import { COUNTIES, PROPERTY_TYPE_LABEL, PROPERTY_TYPES, type PropertyType } from "@/lib/kenya";

type Listings = Envelope<PropertyListItem[]>;

const listingsSchema = z.array(propertyListItem);

const sameFilters = (a: Filters, b: Filters) => JSON.stringify(a) === JSON.stringify(b);

function useDiscoveryQuery(filters: Filters, initial: { filters: Filters; data: Listings | null }) {
  return useQuery({
    queryKey: ["properties", "search", filters],
    queryFn: ({ signal }) =>
      apiFetch("/properties", { schema: listingsSchema, query: toApiQuery(filters, PAGE_SIZE), signal }),
    placeholderData: keepPreviousData,
    initialData: initial.data && sameFilters(filters, initial.filters) ? initial.data : undefined,
    staleTime: 30_000,
  });
}

const BEDROOM_CHOICES = [1, 2, 3, 4] as const;

/** Text input that writes to the URL 400 ms after typing stops (and keeps its own value meanwhile). */
function DebouncedText({
  id,
  value,
  onCommit,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  value: string;
  onCommit: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  // The URL changed from elsewhere (clear filters, back button): take the new value.
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }
  const commit = useDebouncedCallback(onCommit, 400);
  return (
    <input
      id={id}
      value={draft}
      onChange={(event) => {
        setDraft(event.target.value);
        commit(event.target.value);
      }}
      className={controlClass}
      {...props}
    />
  );
}

function FilterPanel({ filters, set }: { filters: Filters; set: (patch: Partial<Filters>) => void }) {
  const id = useId();
  const field = "grid gap-1.5";
  const label = "font-bold";
  return (
    <div className="grid gap-5">
      <div className={field}>
        <label htmlFor={`${id}-q`} className={label}>
          Search
        </label>
        <DebouncedText
          id={`${id}-q`}
          type="search"
          value={filters.q}
          onCommit={(q) => set({ q })}
          placeholder="Title, area or description"
          enterKeyHint="search"
          maxLength={100}
        />
      </div>
      <div className={field}>
        <label htmlFor={`${id}-county`} className={label}>
          County
        </label>
        <NativeSelect
          id={`${id}-county`}
          value={filters.county}
          onChange={(e) => set({ county: e.target.value })}
        >
          <option value="">All counties</option>
          {COUNTIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className={field}>
        <label htmlFor={`${id}-area`} className={label}>
          Area, estate or campus
        </label>
        <DebouncedText
          id={`${id}-area`}
          value={filters.area}
          onCommit={(area) => set({ area })}
          placeholder="e.g. Kilimani"
          maxLength={150}
        />
      </div>
      <fieldset className="grid gap-2">
        <legend className={cn(label, "mb-1.5")}>Type</legend>
        <div className="flex flex-wrap gap-2">
          {[null, ...PROPERTY_TYPES].map((t) => {
            const checked = filters.type === t;
            return (
              <label
                key={t ?? "any"}
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center rounded-sm border px-3 font-bold transition-colors",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                  checked
                    ? "border-ink bg-ink text-surface"
                    : "border-line-strong bg-surface-2 text-ink hover:border-ink",
                )}
              >
                <input
                  type="radio"
                  name={`${id}-type`}
                  className="sr-only"
                  checked={checked}
                  onChange={() => set({ type: t as PropertyType | null })}
                />
                {t ? PROPERTY_TYPE_LABEL[t] : "Any"}
              </label>
            );
          })}
        </div>
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className={cn(label, "mb-1.5")}>Rent a month (KES)</legend>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <label htmlFor={`${id}-min`} className="text-step--1 text-ink-2">
              From
            </label>
            <DebouncedText
              id={`${id}-min`}
              inputMode="numeric"
              pattern="[0-9]*"
              value={filters.minPrice === null ? "" : String(filters.minPrice)}
              onCommit={(v) => set({ minPrice: v.replace(/\D/g, "") ? Number(v.replace(/\D/g, "")) : null })}
              placeholder="0"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor={`${id}-max`} className="text-step--1 text-ink-2">
              Up to
            </label>
            <DebouncedText
              id={`${id}-max`}
              inputMode="numeric"
              pattern="[0-9]*"
              value={filters.maxPrice === null ? "" : String(filters.maxPrice)}
              onCommit={(v) => set({ maxPrice: v.replace(/\D/g, "") ? Number(v.replace(/\D/g, "")) : null })}
              placeholder="Any"
            />
          </div>
        </div>
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className={cn(label, "mb-1.5")}>Bedrooms</legend>
        <div className="flex flex-wrap gap-2">
          {[null, ...BEDROOM_CHOICES].map((b) => {
            const checked = filters.bedrooms === b;
            return (
              <label
                key={b ?? "any"}
                className={cn(
                  "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-sm border px-3 font-bold transition-colors",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                  checked
                    ? "border-ink bg-ink text-surface"
                    : "border-line-strong bg-surface-2 text-ink hover:border-ink",
                )}
              >
                <input
                  type="radio"
                  name={`${id}-beds`}
                  className="sr-only"
                  checked={checked}
                  onChange={() => set({ bedrooms: b })}
                />
                {b === null ? "Any" : b}
              </label>
            );
          })}
        </div>
      </fieldset>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 font-bold">
        <input
          type="checkbox"
          className="size-5 accent-(--ink)"
          checked={filters.available === true}
          onChange={(e) => set({ available: e.target.checked ? true : null })}
        />
        Available now only
      </label>
    </div>
  );
}

export function Discovery({
  initialFilters,
  initial,
}: {
  initialFilters: Filters;
  initial: Listings | null;
}) {
  const [raw, setRaw] = useQueryStates(filterParsers, { history: "push", scroll: false });
  const filters = normaliseFilters(raw);
  const query = useDiscoveryQuery(filters, { filters: initialFilters, data: initial });
  const resultsRef = useRef<HTMLDivElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const set = (patch: Partial<Filters>) =>
    void setRaw({ ...patch, page: "page" in patch ? (patch.page ?? null) : null });
  const clearAll = () => void setRaw({ ...EMPTY_FILTERS, sort: filters.sort, page: null });

  const total = query.data?.meta?.total ?? 0;
  const totalPages = query.data?.meta?.totalPages ?? 1;
  const active = activeFilterCount(filters);
  const listings = query.data?.data ?? [];
  const refreshing = query.isFetching && query.isPlaceholderData;

  const goToPage = (page: number) => {
    set({ page });
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const countText = query.data ? plural(total, "place") : "Loading places";

  return (
    <div className="grid gap-6 lg:grid-cols-[17.5rem_1fr] lg:gap-10">
      <aside aria-labelledby="filters-title" className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-h)+1.5rem)] grid gap-5">
          <div className="flex items-center justify-between">
            <h2 id="filters-title" className="board-type text-step-2">
              Filters
            </h2>
            {active > 0 ? (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            ) : null}
          </div>
          <FilterPanel filters={filters} set={set} />
        </div>
      </aside>

      <div ref={resultsRef} className="grid min-w-0 scroll-mt-24 content-start gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" aria-live="polite" className="font-bold">
            {countText}
            {filters.maxPrice !== null ? (
              <span className="font-normal text-ink-2"> · up to KES {formatAmount(filters.maxPrice)}</span>
            ) : null}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-step--1 text-ink-2">
              Sort
            </label>
            <NativeSelect
              id="sort"
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value as Sort })}
              className="w-auto min-w-44"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {SORT_LABEL[s]}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        {query.isPending ? (
          <div className="grid gap-4">
            <WakingNotice />
            <ul aria-hidden className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i}>
                  <PropertyPlateSkeleton />
                </li>
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
                <Button variant="board" onClick={clearAll}>
                  Clear all filters
                </Button>
              ) : undefined
            }
          >
            <p>
              {active > 0
                ? "Try a wider budget, a nearby area, or any type. New places come in all the time."
                : "KejaLink is new and the first places are on their way. Check back soon."}
            </p>
          </StateBlock>
        ) : (
          <>
            {refreshing ? <WakingNotice /> : null}
            <ul
              aria-busy={refreshing}
              className={cn(
                "grid gap-5 transition-opacity duration-(--dur-2) sm:grid-cols-2 xl:grid-cols-3",
                refreshing && "opacity-60",
              )}
            >
              {listings.map((property, index) => (
                <li key={property.id} className="grid">
                  <PropertyPlate
                    property={property}
                    index={index}
                    priority={index < 2 && filters.page === 1}
                  />
                </li>
              ))}
            </ul>
            <Pagination
              page={filters.page}
              totalPages={totalPages}
              onPage={goToPage}
              disabled={query.isFetching}
            />
          </>
        )}
      </div>

      {/* Phones: filters live in a bottom sheet, opened from a bar in thumb reach. */}
      <div className="sticky bottom-0 z-30 -mx-(--gutter) border-t border-line bg-surface/95 px-(--gutter) py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
          <DialogTrigger asChild>
            <Button variant="board" block size="lg">
              <SlidersHorizontal aria-hidden />
              Filters{active > 0 ? ` (${active})` : ""}
            </Button>
          </DialogTrigger>
          <DialogContent variant="sheet" title="Filters" description={countText}>
            <FilterPanel filters={filters} set={set} />
            <div className="sticky bottom-0 -mx-5 mt-6 flex gap-3 border-t border-line bg-surface-2 px-5 pt-4">
              {active > 0 ? (
                <Button variant="ghost" onClick={clearAll}>
                  Clear all
                </Button>
              ) : null}
              <Button variant="band" block onClick={() => setSheetOpen(false)}>
                {query.data ? `Show ${plural(total, "place")}` : "Show places"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
