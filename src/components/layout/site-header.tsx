"use client";

import { Bookmark, LogOut, Menu, Plus, Search } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { UserRole } from "@/lib/api/schemas/common";
import { authClient, useSession } from "@/lib/auth/client";
import { ROLE_HOME } from "@/lib/auth/roles";
import { NavLink, type NavItem } from "./nav-link";
import { Wordmark } from "./wordmark";

/** The phone menu sheet (and the dialog code behind it) loads on first open, not with the page. */
const MobileMenu = dynamic(() => import("./mobile-menu"), { ssr: false });

const PUBLIC_NAV: NavItem[] = [
  { href: "/properties", label: "Browse places" },
  { href: "/how-it-works", label: "How it works" },
];

const ROLE_NAV: Record<UserRole, NavItem[]> = {
  SEEKER: [
    { href: "/properties", label: "Browse places" },
    { href: "/seeker/requests", label: "My requests" },
  ],
  TENANT: [
    { href: "/tenant/properties", label: "My listings" },
    { href: "/tenant/requests", label: "Requests" },
  ],
  ADMIN: [
    { href: "/admin/users", label: "Users" },
    { href: "/admin/properties", label: "Listings" },
    { href: "/admin/bookings", label: "Requests" },
  ],
};

/**
 * R1 header search: a grey field with an orange search icon. A GET form to /properties, so it works
 * before JavaScript; on the results page it shows the current search.
 */
function HeaderSearch({ className }: { className?: string }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = pathname === "/properties" ? (params.get("q") ?? "") : "";
  return (
    <form action="/properties" method="get" role="search" aria-label="Search listings" className={className}>
      <label className="flex min-h-10 items-center gap-2 rounded-md bg-ground px-3 focus-within:outline-2 focus-within:outline-focus">
        <Search aria-hidden className="size-4 shrink-0 text-accent" />
        <span className="sr-only">Search listings</span>
        <input
          key={current}
          name="q"
          type="search"
          defaultValue={current}
          placeholder="Search by area, estate or title"
          enterKeyHint="search"
          maxLength={100}
          className="w-full min-w-0 bg-transparent text-step--1 text-ink outline-none placeholder:text-ink-3"
        />
      </label>
    </form>
  );
}

const isRole = (value: unknown): value is UserRole =>
  value === "SEEKER" || value === "TENANT" || value === "ADMIN";

export function SiteHeader() {
  const { data, isPending } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Mount the lazy menu only once it has been asked for.
  const [menuLoaded, setMenuLoaded] = useState(false);
  const user = data?.user;
  const role = isRole(user?.role) ? user.role : null;
  const nav = role ? ROLE_NAV[role] : PUBLIC_NAV;
  // Discovery fills the window edge to edge (R1); everywhere else the header follows the page width.
  const fullBleed = usePathname() === "/properties";

  async function signOut() {
    setOpen(false);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper text-ink">
      <div className={cn("flex h-(--header-h) items-center gap-4", fullBleed ? "px-4 md:px-6" : "wrap")}>
        <Link href={role ? ROLE_HOME[role] : "/"} className="shrink-0 rounded-xs" aria-label="KejaLink home">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-5 md:flex lg:ml-10">
          {nav.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {role !== "ADMIN" ? <HeaderSearch className="ml-auto hidden w-full max-w-sm lg:block" /> : null}

        <div className={cn("flex items-center gap-2", role === "ADMIN" ? "ml-auto" : "ml-auto lg:ml-2")}>
          {isPending ? (
            <span aria-hidden className="h-9 w-24 rounded-sm bg-sunk" />
          ) : user && role ? (
            <div className="hidden items-center gap-2 md:flex">
              {role === "SEEKER" ? (
                <Link
                  href="/seeker/saved"
                  aria-label="Saved places"
                  title="Saved places"
                  className="grid size-10 place-items-center rounded-md text-primary hover:bg-primary-soft"
                >
                  <Bookmark aria-hidden className="size-5" />
                </Link>
              ) : null}
              {role === "TENANT" ? (
                <Button asChild variant="primary" size="sm">
                  <Link href="/tenant/properties/new">
                    <Plus aria-hidden />
                    Add listing
                  </Link>
                </Button>
              ) : null}
              <Link
                href={`${ROLE_HOME[role]}/account`}
                className="inline-flex min-h-11 items-center gap-2 rounded-sm px-2 text-ink-2 hover:text-ink"
              >
                <Avatar name={user.name} size="sm" className="rounded-md" />
                <span className="max-w-[12ch] truncate font-medium text-ink">{user.name.split(" ")[0]}</span>
              </Link>
              <Button variant="ghost" size="sm" className="text-ink-2 hover:text-ink" onClick={signOut}>
                <LogOut aria-hidden />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild variant="primary" size="sm">
                <Link href="/register?as=tenant">
                  <Plus aria-hidden />
                  List a place
                </Link>
              </Button>
            </div>
          )}

          {/* Phones: sign-in stays one tap away beside the menu. */}
          {!isPending && !user ? (
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center px-2 font-medium text-ink underline-offset-4 hover:underline md:hidden"
            >
              Sign in
            </Link>
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => {
              setMenuLoaded(true);
              setOpen(true);
            }}
          >
            <Menu aria-hidden className="size-6" />
            <span className="sr-only">Open menu</span>
          </Button>
          {menuLoaded ? (
            <MobileMenu
              open={open}
              onOpenChange={setOpen}
              nav={nav}
              role={role}
              userName={user?.name ?? null}
              onSignOut={signOut}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}

/** Static stand-in while the header (which reads the URL and session) streams in. Same size, no shift. */
export function SiteHeaderFallback() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper text-ink">
      <div className="wrap flex h-(--header-h) items-center gap-4">
        <Link href="/" className="shrink-0 rounded-xs" aria-label="KejaLink home">
          <Wordmark />
        </Link>
        <nav aria-label="Main" className="ml-4 hidden items-center gap-5 md:flex lg:ml-10">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center px-1 text-step--1 font-medium text-ink-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <span aria-hidden className="ml-auto h-9 w-24 rounded-sm bg-sunk" />
      </div>
    </header>
  );
}
