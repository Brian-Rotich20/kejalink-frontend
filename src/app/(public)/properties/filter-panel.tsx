"use client";

import {
  BedSingle,
  Building2,
  Check,
  DoorOpen,
  House,
  LayoutGrid,
  type LucideIcon,
  Minus,
  Plus,
  Sofa,
} from "lucide-react";
import { useId, useState } from "react";
import { controlClass, NativeSelect } from "@/components/ui/field";
import { useDebouncedCallback } from "@/hooks/use-debounced";
import { cn } from "@/lib/cn";
import type { Filters } from "@/lib/filters";
import { formatAmount } from "@/lib/format";
import { AMENITY_FILTERS, COUNTIES, PROPERTY_TYPE_LABEL, PROPERTY_TYPES, type PropertyType } from "@/lib/kenya";

const TYPE_ICON: Record<PropertyType, LucideIcon> = {
  HOUSE: House,
  APARTMENT: Building2,
  BEDSITTER: BedSingle,
  STUDIO: Sofa,
  ROOM: DoorOpen,
  OTHER: LayoutGrid,
};

/** Slider range (KES a month). The top of the slider means "no upper limit". */
const PRICE_MAX = 150_000;
const PRICE_STEP = 500;

export type SetFilters = (patch: Partial<Filters>) => void;

const groupTitle = "text-step--1 font-semibold text-ink";

/** Text input that writes to the URL 400 ms after typing stops (and keeps its own value meanwhile). */
function DebouncedText({
  value,
  onCommit,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange"> & { value: string; onCommit: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  // The URL changed from elsewhere (reset, back button): take the new value.
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }
  const commit = useDebouncedCallback(onCommit, 400);
  return (
    <input
      value={draft}
      onChange={(event) => {
        setDraft(event.target.value);
        commit(event.target.value);
      }}
      className={cn(controlClass, className)}
      {...props}
    />
  );
}

/** R1 property-type tiles: icon over label; the selected one is solid green. Clicking it again clears it. */
function TypeTiles({ value, onChange }: { value: PropertyType | null; onChange: (t: PropertyType | null) => void }) {
  return (
    <div role="group" aria-label="Property type" className="grid grid-cols-3 gap-2">
      {PROPERTY_TYPES.map((t) => {
        const Icon = TYPE_ICON[t];
        const on = value === t;
        return (
          <button
            key={t}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? null : t)}
            className={cn(
              "grid min-h-16 place-items-center content-center gap-1 rounded-md px-1 py-2 text-step--2 font-medium transition-colors",
              on ? "bg-primary text-on-primary" : "bg-sunk text-ink-2 hover:bg-primary-soft",
            )}
          >
            <Icon aria-hidden className={cn("size-5", on ? "text-on-primary" : "text-primary")} />
            {PROPERTY_TYPE_LABEL[t]}
          </button>
        );
      })}
    </div>
  );
}

/** R1 price range: a two-handle slider, the two values boxed, and "Ok" to apply. */
function PriceRange({
  min,
  max,
  onApply,
}: {
  min: number | null;
  max: number | null;
  onApply: (min: number | null, max: number | null) => void;
}) {
  const [draft, setDraft] = useState<[number, number]>([min ?? 0, max ?? PRICE_MAX]);
  const [synced, setSynced] = useState(`${min}|${max}`);
  if (`${min}|${max}` !== synced) {
    setSynced(`${min}|${max}`);
    setDraft([min ?? 0, max ?? PRICE_MAX]);
  }
  const [lo, hi] = draft;
  const pct = (v: number) => `${(v / PRICE_MAX) * 100}%`;
  const label = (v: number) => (v >= PRICE_MAX ? `${formatAmount(PRICE_MAX)}+` : formatAmount(v));
  const thumb =
    "pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-paper [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-1 " +
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-paper [&::-moz-range-thumb]:bg-primary " +
    "focus-visible:outline-none [&:focus-visible::-webkit-slider-thumb]:outline-2 [&:focus-visible::-webkit-slider-thumb]:outline-offset-2 [&:focus-visible::-webkit-slider-thumb]:outline-focus";
  return (
    <fieldset className="grid gap-3">
      <legend className={cn(groupTitle, "mb-3")}>Price a month (KES)</legend>
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-pill bg-sunk" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-pill bg-primary"
          style={{ left: pct(lo), right: `calc(100% - ${pct(hi)})` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          aria-valuetext={`KES ${label(lo)}`}
          min={0}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={lo}
          onChange={(e) => setDraft([Math.min(Number(e.target.value), hi - PRICE_STEP), hi])}
          className={thumb}
        />
        <input
          type="range"
          aria-label="Maximum price"
          aria-valuetext={hi >= PRICE_MAX ? "No maximum" : `KES ${label(hi)}`}
          min={0}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={hi}
          onChange={(e) => setDraft([lo, Math.max(Number(e.target.value), lo + PRICE_STEP)])}
          className={thumb}
        />
      </div>
      <div className="flex items-center gap-2">
        <output className="min-w-0 flex-1 truncate rounded-sm border border-line px-2 py-1.5 text-center text-step--2 tabular-nums">
          {label(lo)}
        </output>
        <span aria-hidden className="text-ink-3">
          –
        </span>
        <output className="min-w-0 flex-1 truncate rounded-sm border border-line px-2 py-1.5 text-center text-step--2 tabular-nums">
          {label(hi)}
        </output>
        <button
          type="button"
          onClick={() => onApply(lo > 0 ? lo : null, hi < PRICE_MAX ? hi : null)}
          className="min-h-9 rounded-sm bg-primary px-3 text-step--1 font-semibold text-on-primary hover:bg-primary-hover"
        >
          Ok
        </button>
      </div>
    </fieldset>
  );
}

/** R1 stepper: − value +, where the lowest step means "any". */
function Stepper({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  const id = useId();
  const btn =
    "grid size-9 place-items-center rounded-sm bg-primary-soft text-primary transition-colors hover:bg-primary hover:text-on-primary disabled:opacity-40 disabled:hover:bg-primary-soft disabled:hover:text-primary [&_svg]:size-4";
  const shown = value === null ? "Any" : `${value}+`;
  return (
    <div className="grid gap-2">
      <span id={id} className={groupTitle}>
        {label}
      </span>
      <div role="group" aria-labelledby={id} className="flex items-center gap-1">
        <button
          type="button"
          className={btn}
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value === null}
          onClick={() => onChange(value === null || value <= 1 ? null : value - 1)}
        >
          <Minus aria-hidden />
        </button>
        <output aria-live="polite" className="min-w-10 text-center font-semibold tabular-nums">
          {shown}
        </output>
        <button
          type="button"
          className={btn}
          aria-label={`More ${label.toLowerCase()}`}
          disabled={value !== null && value >= 6}
          onClick={() => onChange(value === null ? 1 : value + 1)}
        >
          <Plus aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** R1 checkbox row: a green box and a green label when checked. */
function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2.5 text-step--1">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className={cn(
          "grid size-4.5 shrink-0 place-items-center rounded-xs border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
          checked ? "border-primary bg-primary text-on-primary" : "border-line-strong bg-paper",
        )}
      >
        {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
      </span>
      <span className={checked ? "font-medium text-primary" : "text-ink-2"}>{label}</span>
    </label>
  );
}

/** The R1 filter column (also the content of the phone filter sheet). */
export function FilterPanel({ filters, set }: { filters: Filters; set: SetFilters }) {
  const id = useId();
  const amenities = new Set(filters.amenities);
  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <span className={groupTitle}>Property type</span>
        <TypeTiles value={filters.type} onChange={(type) => set({ type })} />
      </div>

      <div className="grid gap-3">
        <span className={groupTitle}>Location</span>
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-area`} className="text-step--2 text-ink-2">
            Area, estate or campus
          </label>
          <DebouncedText
            id={`${id}-area`}
            value={filters.area}
            onCommit={(area) => set({ area })}
            placeholder="e.g. Kilimani"
            maxLength={150}
            className="min-h-10"
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-county`} className="text-step--2 text-ink-2">
            County
          </label>
          <NativeSelect
            id={`${id}-county`}
            value={filters.county}
            onChange={(e) => set({ county: e.target.value })}
            className="min-h-10"
          >
            <option value="">All counties</option>
            {COUNTIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <PriceRange
        min={filters.minPrice}
        max={filters.maxPrice}
        onApply={(minPrice, maxPrice) => set({ minPrice, maxPrice })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Stepper label="Bedrooms" value={filters.bedrooms} onChange={(bedrooms) => set({ bedrooms })} />
        <Stepper label="Bathrooms" value={filters.baths} onChange={(baths) => set({ baths })} />
      </div>

      <fieldset className="grid gap-1">
        <legend className={cn(groupTitle, "mb-2")}>Additional conveniences</legend>
        {AMENITY_FILTERS.map((a) => {
          const key = a.toLowerCase();
          return (
            <CheckRow
              key={a}
              label={a}
              checked={amenities.has(key)}
              onChange={(on) =>
                set({ amenities: on ? [...filters.amenities, key] : filters.amenities.filter((x) => x !== key) })
              }
            />
          );
        })}
      </fieldset>

      <fieldset className="grid gap-1">
        <legend className={cn(groupTitle, "mb-2")}>Availability</legend>
        <CheckRow
          label="Available now only"
          checked={filters.available === true}
          onChange={(on) => set({ available: on ? true : null })}
        />
      </fieldset>
    </div>
  );
}
