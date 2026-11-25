"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { makeQueryClient, type SessionProblem } from "@/lib/api/query-client";
import { authClient } from "@/lib/auth/client";
import { loginHref } from "@/lib/auth/roles";
import { OfflineBanner } from "./offline-banner";

let handling = false;

/** A dead or suspended session anywhere: clear it, then send the person somewhere useful. */
async function handleSessionProblem(problem: SessionProblem) {
  if (handling) return;
  handling = true;
  try {
    await authClient.signOut();
  } catch {
    // The cookie may already be gone; carry on.
  }
  const here = `${window.location.pathname}${window.location.search}`;
  window.location.assign(problem === "suspended" ? "/suspended" : loginHref(here));
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState<QueryClient>(() => makeQueryClient(handleSessionProblem));
  return (
    <QueryClientProvider client={client}>
      <NuqsAdapter>{children}</NuqsAdapter>
      <OfflineBanner />
      <Toaster
        position="bottom-center"
        closeButton
        toastOptions={{
          classNames: {
            toast:
              "!rounded-sm !border !border-board-line !bg-board !font-sans !text-on-board !shadow-2 !text-step--1",
            description: "!text-on-board-2",
            actionButton: "!bg-band !text-on-band !font-bold",
            closeButton: "!bg-board-2 !text-on-board !border-board-line",
          },
        }}
      />
    </QueryClientProvider>
  );
}
