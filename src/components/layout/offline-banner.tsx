"use client";

import { WifiOff } from "lucide-react";
import { useOnline } from "@/hooks/use-online";

/** A calm strip when the phone loses its connection; disappears on its own when it's back. */
export function OfflineBanner() {
  const online = useOnline();
  return (
    <div role="status" aria-live="polite">
      {online ? null : (
        <p className="on-board fixed inset-x-0 top-(--header-h) z-50 flex items-center justify-center gap-2 bg-board px-4 py-2 text-step--1 font-bold text-on-board">
          <WifiOff aria-hidden className="size-4 text-band" />
          You&apos;re offline. We&apos;ll pick up where you left off when you&apos;re back.
        </p>
      )}
    </div>
  );
}
