"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type NavItem = { href: string; label: string };

/** Header link; `large` is the phone-menu style. The current page is marked for screen readers. */
export function NavLink({ item, onClick, large }: { item: NavItem; onClick?: () => void; large?: boolean }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex min-h-11 items-center px-1 font-medium text-ink-2 transition-colors hover:text-ink",
        // R1: the current section in bold primary green.
        "aria-[current=page]:font-bold aria-[current=page]:text-primary",
        large ? "w-full border-b border-line py-3 text-step-2 font-bold text-ink" : "text-step--1",
      )}
    >
      {item.label}
    </Link>
  );
}
