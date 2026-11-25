import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Empty, error and blocked states: say what happened and what to do next. */
export function StateBlock({
  icon: Icon,
  title,
  children,
  action,
  tone = "neutral",
  className,
  headingLevel: Heading = "h2",
}: {
  icon?: LucideIcon;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "danger" | "warning";
  className?: string;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <div
      className={cn(
        "grid justify-items-start gap-3 rounded-md border p-6 md:p-8",
        tone === "neutral" && "border-dashed border-line-strong bg-surface",
        tone === "danger" && "border-danger/40 bg-danger-soft",
        tone === "warning" && "border-warning/40 bg-warning-soft",
        className,
      )}
    >
      {Icon ? (
        <Icon
          aria-hidden
          className={cn(
            "size-7",
            tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-ink-3",
          )}
        />
      ) : null}
      <Heading className="board-type text-step-3">{title}</Heading>
      {children ? <div className="measure grid gap-2 text-ink-2">{children}</div> : null}
      {action ? <div className="mt-1 flex flex-wrap gap-3">{action}</div> : null}
    </div>
  );
}
