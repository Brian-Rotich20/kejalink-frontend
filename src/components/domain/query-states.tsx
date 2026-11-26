"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { WakingNotice } from "@/components/layout/waking";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StateBlock } from "@/components/ui/state";
import { isApiError, messageFor } from "@/lib/api/errors";

/** Loading: skeleton rows plus the waking note after 4 s. */
export function ListLoading({ rows = 3, height = "h-32" }: { rows?: number; height?: string }) {
  return (
    <div className="grid gap-4">
      <WakingNotice />
      <div aria-hidden className="grid gap-4">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className={height} />
        ))}
      </div>
    </div>
  );
}

/** Error with a retry; rate limits say when to try again. */
export function QueryError({
  error,
  retry,
  retrying,
}: {
  error: unknown;
  retry: () => void;
  retrying?: boolean;
}) {
  const wait =
    isApiError(error) && error.retryAfter ? ` Try again in about ${error.retryAfter} seconds.` : "";
  return (
    <StateBlock
      icon={AlertTriangle}
      tone="warning"
      title="This didn't load"
      action={
        <Button onClick={retry} loading={retrying}>
          <RotateCcw aria-hidden />
          Try again
        </Button>
      }
    >
      <p>
        {messageFor(error)}
        {wait}
      </p>
    </StateBlock>
  );
}
