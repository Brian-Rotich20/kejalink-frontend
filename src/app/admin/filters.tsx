"use client";

import { useId } from "react";
import { NativeSelect } from "@/components/ui/field";

/** A labelled select for admin filter bars. */
export function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: readonly { value: T; label: string }[];
  onChange: (value: T | null) => void;
}) {
  const id = useId();
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-step--1 font-bold text-ink-2">
        {label}
      </label>
      <NativeSelect
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value || null) as T | null)}
        className="min-w-40 md:min-h-10"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

export function ResultCount({
  total,
  noun,
  loading,
}: {
  total: number | undefined;
  noun: string;
  loading: boolean;
}) {
  return (
    <p role="status" aria-live="polite" className="text-step--1 font-bold text-ink-2">
      {loading && total === undefined ? "Loading…" : `${total ?? 0} ${noun}${total === 1 ? "" : "s"}`}
    </p>
  );
}
