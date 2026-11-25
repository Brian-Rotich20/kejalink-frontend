import { cn } from "@/lib/cn";

/** Set type until a real logo exists: two route-board plates, band and ink. */
export function Wordmark({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  return (
    <span
      className={cn(
        "board-type inline-flex items-stretch leading-none",
        size === "md" ? "text-[1.375rem]" : "text-step-4",
        className,
      )}
    >
      <span className="rounded-l-xs bg-band px-[0.3em] pt-[0.16em] pb-[0.1em] text-on-band">Keja</span>
      <span className="rounded-r-xs bg-board px-[0.3em] pt-[0.16em] pb-[0.1em] text-band ring-1 ring-board-line ring-inset">
        Link
      </span>
    </span>
  );
}
