import { cn } from "@/lib/cn";

/**
 * The masthead: the name set in Newsreader, like a publication's nameplate. A wordmark only
 * (no invented logo) until the owner supplies one. `tone="light"` is for forest/charcoal grounds.
 */
export function Wordmark({
  className,
  size = "md",
  tone = "forest",
}: {
  className?: string;
  size?: "md" | "lg";
  tone?: "forest" | "light";
}) {
  return (
    <span
      className={cn(
        "font-serif font-semibold tracking-[-0.02em] [font-optical-sizing:auto]",
        size === "md" ? "text-[1.6rem] leading-none" : "text-step-5 leading-none",
        tone === "forest" ? "text-forest" : "text-on-forest",
        className,
      )}
    >
      KejaLink
    </span>
  );
}
