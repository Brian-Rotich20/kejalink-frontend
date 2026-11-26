"use client";

import { ArrowRight } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatAmount } from "@/lib/format";
import { BUDGET_STEPS, COUNTIES, PROPERTY_TYPE_LABEL, PROPERTY_TYPES, type PropertyType } from "@/lib/kenya";

const boardField =
  "block w-full min-h-12 rounded-sm border border-board-line bg-board-2 px-3 text-on-board placeholder:text-on-board-2/80 " +
  "transition-colors hover:border-on-board-2 focus-visible:border-band focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-band";

const selectChevron =
  "appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9 " +
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23c5c4c0' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]";

/** One line of the destination readout. Callers key it by value, so a change remounts it and it flips. */
function ReadoutLine({ value, muted }: { value: string; muted?: boolean }) {
  return (
    <span
      className={cn(
        "inline-block animate-[board-flip_var(--dur-3)_var(--ease-out)] motion-reduce:animate-none",
        muted && "text-on-board-2",
      )}
    >
      {value}
    </span>
  );
}

/**
 * The hero's working search, set as a matatu route board. A plain GET form to /properties, so it
 * works before JavaScript loads; the readout above it repeats the choices in board lettering.
 */
export function RouteBoardSearch({ className }: { className?: string }) {
  const id = useId();
  const [area, setArea] = useState("");
  const [county, setCounty] = useState("");
  const [type, setType] = useState<PropertyType | "">("");
  const [maxPrice, setMaxPrice] = useState("");

  const where = area.trim() || county || "Anywhere";
  const what = type ? PROPERTY_TYPE_LABEL[type] : "Any type";
  const budget = maxPrice ? `≤ KES ${formatAmount(Number(maxPrice))}` : "Any budget";

  return (
    <form
      action="/properties"
      method="get"
      role="search"
      onSubmit={(event) => {
        // Keep the shared URL clean: empty choices are not sent.
        for (const field of Array.from(event.currentTarget.elements)) {
          if (
            (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) &&
            field.value === ""
          ) {
            field.removeAttribute("name");
          }
        }
      }}
      aria-labelledby={`${id}-title`}
      className={cn("on-board overflow-hidden rounded-md bg-board text-on-board", className)}
    >
      <div className="border-b border-board-line px-4 pt-4 pb-3 sm:px-6">
        <h2 id={`${id}-title`} className="sr-only">
          Where to?
        </h2>
        <p
          aria-hidden
          className="board-type flex flex-col gap-y-1 text-step-3 sm:flex-row sm:flex-wrap sm:gap-x-3 sm:text-step-4"
        >
          <ReadoutLine key={`w-${where}`} value={where} />
          <span className="hidden text-on-board-2 sm:inline">·</span>
          <ReadoutLine key={`t-${what}`} value={what} muted={!type} />
          <span className="hidden text-on-board-2 sm:inline">·</span>
          <ReadoutLine key={`b-${budget}`} value={budget} muted={!maxPrice} />
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:px-6 sm:pb-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-end">
        <div className="col-span-2 grid gap-1.5 lg:col-span-1">
          <label htmlFor={`${id}-area`} className="text-step--1 font-bold text-on-board-2">
            Area, estate or campus
          </label>
          <input
            id={`${id}-area`}
            name="area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Kahawa Wendani"
            autoComplete="off"
            enterKeyHint="search"
            maxLength={150}
            className={boardField}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-county`} className="text-step--1 font-bold text-on-board-2">
            County
          </label>
          <select
            id={`${id}-county`}
            name="county"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className={cn(boardField, selectChevron)}
          >
            <option value="">All counties</option>
            {COUNTIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-type`} className="text-step--1 font-bold text-on-board-2">
            Type
          </label>
          <select
            id={`${id}-type`}
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as PropertyType | "")}
            className={cn(boardField, selectChevron)}
          >
            <option value="">Any type</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {PROPERTY_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 grid gap-1.5 lg:col-span-1">
          <label htmlFor={`${id}-budget`} className="text-step--1 font-bold text-on-board-2">
            Budget a month
          </label>
          <select
            id={`${id}-budget`}
            name="maxPrice"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className={cn(boardField, selectChevron)}
          >
            <option value="">Any budget</option>
            {BUDGET_STEPS.map((step) => (
              <option key={step} value={step}>
                Up to KES {formatAmount(step)}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="submit"
          variant="band"
          size="lg"
          className="col-span-2 min-h-12 w-full lg:col-span-1 lg:w-auto"
        >
          Show places
          <ArrowRight aria-hidden />
        </Button>
      </div>
    </form>
  );
}
