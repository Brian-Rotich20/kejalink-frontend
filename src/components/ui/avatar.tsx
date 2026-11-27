import { cn } from "@/lib/cn";

/** Initials avatar: V1 has no avatar upload, so this is the only face a user has. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-sm bg-primary-soft font-semibold text-primary-text",
        size === "sm" && "size-8 text-[0.8rem]",
        size === "md" && "size-11 text-step-0",
        size === "lg" && "size-14 text-step-2",
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
