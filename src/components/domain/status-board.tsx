"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatAmount } from "@/lib/format";

export type BoardRow = {
  label: string;
  href: string;
  queryKey: readonly unknown[];
  count: () => Promise<number>;
  /** Highlight the row when its count is above zero (things waiting on you). */
  attention?: boolean;
};

function Row({ row }: { row: BoardRow }) {
  const { data, isPending, isError } = useQuery({
    queryKey: row.queryKey,
    queryFn: row.count,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  });
  const hot = row.attention && (data ?? 0) > 0;
  return (
    <li>
      <Link
        href={row.href}
        className={cn(
          "group flex min-h-16 items-center gap-4 px-4 py-3 transition-colors hover:bg-board-2 focus-visible:bg-board-2",
          hot && "underline decoration-2 underline-offset-4",
        )}
      >
        <span className="board-type-wide flex-1 text-step-0">{row.label}</span>
        <span className="board-type tabular min-w-[3ch] text-right text-step-4">
          {isPending ? <span className="text-on-board-2">··</span> : isError ? "–" : formatAmount(data ?? 0)}
        </span>
        <ChevronRight
          aria-hidden
          className="size-5 text-on-board-2 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </li>
  );
}

/** Counts as a departures board: label left, figure right, each row a link to the list behind it. */
export function StatusBoard({ title, rows }: { title: string; rows: BoardRow[] }) {
  return (
    <section aria-label={title} className="on-board overflow-hidden rounded-md bg-board text-on-board">
      <h2 className="board-type-wide border-b border-board-line px-4 py-3 text-step--1 text-on-board-2">
        {title}
      </h2>
      <ul className="divide-y divide-board-line">
        {rows.map((row) => (
          <Row key={row.label} row={row} />
        ))}
      </ul>
    </section>
  );
}
