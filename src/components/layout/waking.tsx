"use client";

import { useElapsed } from "@/hooks/use-delayed-flag";
import { cn } from "@/lib/cn";

function WakingMessage() {
  const show = useElapsed(4000);
  if (!show) return null;
  return (
    <span className="pull-in inline-flex items-center gap-3 rounded-sm bg-board px-3 py-2 text-step--1 text-on-board">
      <span aria-hidden className="size-2 shrink-0 rounded-pill bg-primary" />
      Waking the server up, one moment. This can take up to a minute after a quiet spell.
    </span>
  );
}

/**
 * Calm cold-start note: silent for the first ~4 s of a wait, then explains that the server is
 * waking up. Skeletons around it stay visible; this never replaces them. The live region stays
 * mounted so the message is announced when it appears.
 */
export function WakingNotice({ active = true, className }: { active?: boolean; className?: string }) {
  return (
    <p role="status" aria-live="polite" className={cn("min-h-0", className)}>
      {active ? <WakingMessage /> : null}
    </p>
  );
}
