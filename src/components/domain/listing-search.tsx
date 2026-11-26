"use client";

import { Search } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatAmount } from "@/lib/format";
import { BUDGET_STEPS, PROPERTY_TYPE_LABEL, PROPERTY_TYPES } from "@/lib/kenya";

const segment =
  "grid min-h-16 content-center gap-0.5 px-4 py-2 transition-colors focus-within:bg-ground has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-focus";
const label = "text-step--1 font-medium text-ink-2";
const control = "w-full min-h-7 bg-transparent text-step-0 text-ink outline-none placeholder:text-ink-3";
const chevron =
  "appearance-none bg-[length:0.9rem] bg-[right_0_center] bg-no-repeat pr-6 " +
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232b2622' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]";

/**
 * The home page search: one ivory panel divided by hairlines (where, type, budget, search).
 * A plain GET form to /properties, so it works before JavaScript loads; empty choices are left out
 * of the URL so shared links stay clean.
 */
export function ListingSearch({ className }: { className?: string }) {
  const id = useId();
  return (
    <form
      action="/properties"
      method="get"
      role="search"
      aria-label="Search places to rent"
      onSubmit={(event) => {
        for (const field of Array.from(event.currentTarget.elements)) {
          if ((field instanceof HTMLInputElement || field instanceof HTMLSelectElement) && field.value === "") {
            field.removeAttribute("name");
          }
        }
      }}
      className={cn(
        "grid overflow-hidden rounded-md border border-line-strong bg-paper",
        "grid-cols-2 divide-line md:grid-cols-[1.6fr_1fr_1fr_auto] md:divide-x",
        className,
      )}
    >
      <div className={cn(segment, "col-span-2 border-b border-line md:col-span-1 md:border-b-0")}>
        <label htmlFor={`${id}-area`} className={label}>
          Where
        </label>
        <input
          id={`${id}-area`}
          name="area"
          placeholder="Area, estate or campus"
          autoComplete="off"
          enterKeyHint="search"
          maxLength={150}
          className={control}
        />
      </div>
      <div className={cn(segment, "border-r border-b border-line md:border-b-0")}>
        <label htmlFor={`${id}-type`} className={label}>
          Type
        </label>
        <select id={`${id}-type`} name="type" defaultValue="" className={cn(control, chevron)}>
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {PROPERTY_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </div>
      <div className={cn(segment, "border-b border-line md:border-b-0")}>
        <label htmlFor={`${id}-budget`} className={label}>
          Budget a month
        </label>
        <select id={`${id}-budget`} name="maxPrice" defaultValue="" className={cn(control, chevron)}>
          <option value="">Any budget</option>
          {BUDGET_STEPS.map((step) => (
            <option key={step} value={step}>
              Up to KES {formatAmount(step)}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-2 p-2 md:col-span-1 md:flex md:items-center">
        <Button type="submit" variant="primary" size="lg" block className="md:w-auto md:px-6">
          <Search aria-hidden />
          Search
        </Button>
      </div>
    </form>
  );
}
