"use client";

import { ErrorState } from "@/components/layout/error-state";

export default function AreaError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState reset={reset} home="/seeker" />;
}
