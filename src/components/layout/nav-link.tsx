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
        "aria-[current=page]:text-ink",
        large
          ? "headline w-full border-b border-line py-3 text-step-3 text-ink"
          : "after:absolute after:inset-x-1 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-band after:transition-transform after:duration-(--dur-2) hover:after:scale-x-100 aria-[current=page]:after:scale-x-100",
      )}
    >
      {item.label}
    </Link>
  );
}
