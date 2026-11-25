"use client";

import { ErrorState } from "@/components/layout/error-state";

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <ErrorState reset={reset} />
    </main>
  );
}
