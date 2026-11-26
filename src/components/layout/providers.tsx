"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { makeQueryClient, type SessionProblem } from "@/lib/api/query-client";
import { authClient } from "@/lib/auth/client";
import { loginHref } from "@/lib/auth/roles";
import { OfflineBanner } from "./offline-banner";

/** Toasts only ever follow an action, so their code loads after the page, not with it. */
const Toaster = dynamic(() => import("sonner").then((m) => m.Toaster), { ssr: false });

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
            toast: "!rounded-sm !border !border-line !bg-paper !font-sans !text-ink !shadow-2 !text-step--1",
            description: "!text-ink-2",
            actionButton: "!bg-forest !text-on-forest !font-semibold",
            closeButton: "!bg-paper !text-ink !border-line",
          },
        }}
      />
    </QueryClientProvider>
  );
}
