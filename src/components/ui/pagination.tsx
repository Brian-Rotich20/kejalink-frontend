"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

/** Prev / next with "Page x of y". Hidden when everything fits on one page. */
export function Pagination({
  page,
  totalPages,
  onPage,
  label = "Pagination",
  disabled,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
  label?: string;
  disabled?: boolean;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label={label} className="flex items-center justify-between gap-3 border-t border-line pt-5">
      <Button onClick={() => onPage(page - 1)} disabled={disabled || page <= 1}>
        <ChevronLeft aria-hidden />
        Previous
      </Button>
      <p className="text-step--1 text-ink-2" aria-live="polite">
        Page <strong className="tabular text-ink">{page}</strong> of{" "}
        <span className="tabular">{totalPages}</span>
      </p>
      <Button onClick={() => onPage(page + 1)} disabled={disabled || page >= totalPages}>
        Next
        <ChevronRight aria-hidden />
      </Button>
    </nav>
  );
}
