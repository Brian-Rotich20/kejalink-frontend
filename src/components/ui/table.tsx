import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Dense data table for admin screens: sticky header, fixed columns, tabular numerals,
 * horizontal scroll on narrow screens (the region is focusable so keyboards can scroll it).
 */
export function Table({ className, label, ...props }: ComponentProps<"table"> & { label: string }) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="max-h-[70dvh] overflow-auto rounded-md border border-line bg-paper focus-visible:outline-offset-2"
    >
      <table className={cn("tabular w-full border-collapse text-left text-step--1", className)} {...props} />
    </div>
  );
}

export function THead(props: ComponentProps<"thead">) {
  return <thead className="sticky top-0 z-10 border-b border-line-strong bg-paper text-ink-2" {...props} />;
}

export function TH({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn("px-3 py-2.5 text-step--1 font-semibold whitespace-nowrap text-ink-2", className)}
      {...props}
    />
  );
}

export function TR({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn("border-t border-line align-top transition-colors hover:bg-ground", className)}
      {...props}
    />
  );
}

export function TD({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-3 py-2", className)} {...props} />;
}
