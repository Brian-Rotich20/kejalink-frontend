import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-[skeleton_1.6s_var(--ease-in-out)_infinite] rounded-sm bg-surface-sunk motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
