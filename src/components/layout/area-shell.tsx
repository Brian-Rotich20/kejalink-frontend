"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { countPending, keys } from "@/lib/api/resources";
import type { UserRole } from "@/lib/api/schemas/common";
import { cn } from "@/lib/cn";

type AreaNavItem = { href: string; label: string; exact?: boolean; badge?: "mine" | "received" };

export const AREA_NAV: Record<UserRole, AreaNavItem[]> = {
  SEEKER: [
    { href: "/seeker", label: "Overview", exact: true },
    { href: "/seeker/requests", label: "My requests", badge: "mine" },
    { href: "/seeker/account", label: "Account" },
  ],
  TENANT: [
    { href: "/tenant", label: "Overview", exact: true },
    { href: "/tenant/properties", label: "Listings" },
    { href: "/tenant/requests", label: "Requests", badge: "received" },
    { href: "/tenant/account", label: "Account" },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview", exact: true },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/properties", label: "Listings" },
    { href: "/admin/bookings", label: "Requests" },
    { href: "/admin/account", label: "Account" },
  ],
};

/** Pending-request count (V1 has no notifications): refetched whenever the tab regains focus. */
export function usePendingCount(side: "mine" | "received" | undefined) {
  return useQuery({
    queryKey: keys.pendingCount(side ?? "mine"),
    queryFn: () => countPending(side ?? "mine"),
    enabled: side !== undefined,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  });
}

function PendingBadge({ side }: { side: "mine" | "received" }) {
  const { data } = usePendingCount(side);
  if (!data) return null;
  return (
    <span className="tabular ml-1.5 inline-grid min-w-5 place-items-center rounded-pill bg-band px-1.5 text-[0.75rem] leading-5 font-bold text-on-band">
      {data > 99 ? "99+" : data}
      <span className="sr-only"> pending</span>
    </span>
  );
}

export function AreaShell({ role, children }: { role: UserRole; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-1 flex-col">
      <nav aria-label="Area" className="border-b border-line bg-surface-2">
        <ul className="wrap flex [scrollbar-width:none] gap-1 overflow-x-auto">
          {AREA_NAV[role].map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "-mb-px inline-flex min-h-12 items-center border-b-[3px] px-3 font-bold transition-colors",
                    active ? "border-ink text-ink" : "border-transparent text-ink-2 hover:text-ink",
                  )}
                >
                  {item.label}
                  {item.badge ? <PendingBadge side={item.badge} /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="wrap grid flex-1 content-start gap-8 py-8 md:py-10">{children}</div>
    </div>
  );
}

export function PageTitle({
  title,
  children,
  action,
}: {
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-2">
        <h1 className="board-type text-step-5">{title}</h1>
        {children ? <div className="measure text-ink-2">{children}</div> : null}
      </div>
      {action}
    </div>
  );
}
