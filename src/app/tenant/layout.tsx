import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaFallback, AreaGuard } from "@/components/layout/area-guard";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: LayoutProps<"/tenant">) {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <Suspense fallback={<AreaFallback />}>
        <AreaGuard role="TENANT">{children}</AreaGuard>
      </Suspense>
    </main>
  );
}
