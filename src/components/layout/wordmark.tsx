import { House } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The brand lockup (R1): a small mark beside the name in bold. The mark is a plain house glyph in
 * a primary tile until the owner supplies a logo. `tone="light"` is for primary or dark grounds.
 */
export function Wordmark({
  className,
  size = "md",
  tone = "primary",
}: {
  className?: string;
  size?: "md" | "lg";
  tone?: "primary" | "light";
}) {
  const lg = size === "lg";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className={cn(
          "grid place-items-center rounded-sm",
          lg ? "size-11" : "size-8",
          tone === "primary" ? "bg-primary text-on-primary" : "bg-paper text-primary-text",
        )}
      >
        <House className={lg ? "size-6" : "size-[1.1rem]"} strokeWidth={2.4} />
      </span>
      <span
        className={cn(
          "font-bold tracking-[-0.02em] leading-none",
          lg ? "text-step-4" : "text-[1.3rem]",
          tone === "primary" ? "text-ink" : "text-on-primary",
        )}
      >
        KejaLink
      </span>
    </span>
  );
}
