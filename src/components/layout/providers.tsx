"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { makeQueryClient } from "@/lib/api/query-client";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState<QueryClient>(makeQueryClient);
  return (
    <QueryClientProvider client={client}>
      <NuqsAdapter>{children}</NuqsAdapter>
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
