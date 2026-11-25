"use client";

import { RotateCcw, WifiOff, Wrench } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useOnline } from "@/hooks/use-online";

/** Shared body for error boundaries: offline-aware, never shows a raw error. */
export function ErrorState({ reset, home = "/" }: { reset: () => void; home?: string }) {
  const offline = !useOnline();

  const Icon = offline ? WifiOff : Wrench;
  return (
    <div className="wrap grid flex-1 content-center gap-6 py-16">
      <Icon aria-hidden className="size-10 text-ink-3" />
      <h1 className="board-type text-step-5">{offline ? "You're offline" : "Something broke"}</h1>
      <p className="measure text-step-1 text-ink-2">
        {offline
          ? "Your phone has lost its connection. Check your data or Wi-Fi, then try again. Nothing you did is lost."
          : "That's on us, not you. Try again; if it keeps happening, the server may be waking up after a quiet spell."}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button variant="band" size="lg" onClick={reset}>
          <RotateCcw aria-hidden />
          Try again
        </Button>
        <Button asChild size="lg">
          <Link href={home}>Go back home</Link>
        </Button>
      </div>
    </div>
  );
}
