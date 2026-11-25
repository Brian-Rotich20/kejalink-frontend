"use client";

import { LogOut, Menu, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { authClient, useSession } from "@/lib/auth/client";
import { ROLE_HOME } from "@/lib/auth/roles";
import { cn } from "@/lib/cn";
import type { UserRole } from "@/lib/api/schemas/common";
import { Wordmark } from "./wordmark";

type NavItem = { href: string; label: string };

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

const isRole = (value: unknown): value is UserRole =>
  value === "SEEKER" || value === "TENANT" || value === "ADMIN";

function NavLink({ item, onClick, large }: { item: NavItem; onClick?: () => void; large?: boolean }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex min-h-11 items-center px-1 font-bold text-ink-2 transition-colors hover:text-ink",
        "aria-[current=page]:text-ink",
        large
          ? "board-type w-full border-b border-line py-3 text-step-3 text-ink"
          : "after:absolute after:inset-x-1 after:bottom-1.5 after:h-[3px] after:origin-left after:scale-x-0 after:bg-band after:transition-transform after:duration-(--dur-2) hover:after:scale-x-100 aria-[current=page]:after:scale-x-100",
      )}
    >
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const { data, isPending } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const user = data?.user;
  const role = isRole(user?.role) ? user.role : null;
  const nav = role ? ROLE_NAV[role] : PUBLIC_NAV;

  async function signOut() {
    setOpen(false);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="on-board sticky top-0 z-40 border-b border-board-line bg-board text-on-board">
      <div className="wrap flex h-(--header-h) items-center gap-4">
        <Link href={role ? ROLE_HOME[role] : "/"} className="shrink-0 rounded-xs" aria-label="KejaLink home">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-5 md:flex">
          {nav.map((item) => (
            <span
              key={item.href}
              className="[&_a]:text-on-board-2 [&_a:hover]:text-on-board [&_a[aria-current=page]]:text-on-board"
            >
              <NavLink item={item} />
            </span>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isPending ? (
            <span aria-hidden className="h-9 w-24 rounded-sm bg-board-2" />
          ) : user && role ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href={`${ROLE_HOME[role]}/account`}
                className="inline-flex min-h-11 items-center gap-2 rounded-sm px-2 text-on-board-2 hover:text-on-board"
              >
                <Avatar name={user.name} size="sm" />
                <span className="max-w-[12ch] truncate font-bold text-on-board">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-on-board-2 hover:bg-board-2 hover:text-on-board"
                onClick={signOut}
              >
                <LogOut aria-hidden />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild variant="ghost" size="sm" className="text-on-board hover:bg-board-2">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="border-board-line bg-board-2 text-on-board hover:border-band hover:bg-board"
              >
                <Link href="/register?as=tenant">List a place</Link>
              </Button>
            </div>
          )}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-on-board hover:bg-board-2 md:hidden">
                <Menu aria-hidden className="size-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DialogTrigger>
            <DialogContent variant="sheet" title="Menu">
              <nav aria-label="Main" className="grid">
                {nav.map((item) => (
                  <NavLink key={item.href} item={item} large onClick={() => setOpen(false)} />
                ))}
                {role ? (
                  <NavLink
                    item={{ href: `${ROLE_HOME[role]}/account`, label: "Account" }}
                    large
                    onClick={() => setOpen(false)}
                  />
                ) : (
                  <NavLink
                    item={{ href: "/how-it-works", label: "How it works" }}
                    large
                    onClick={() => setOpen(false)}
                  />
                )}
              </nav>
              <div className="mt-6 grid gap-3">
                {user ? (
                  <>
                    <p className="flex items-center gap-3 text-ink-2">
                      <UserRound aria-hidden className="size-5" />
                      Signed in as <strong className="text-ink">{user.name}</strong>
                    </p>
                    <Button block onClick={signOut}>
                      <LogOut aria-hidden />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="band" block size="lg">
                      <Link href="/login" onClick={() => setOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                    <Button asChild block size="lg">
                      <Link href="/register?as=tenant" onClick={() => setOpen(false)}>
                        List a place
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}

/** Static stand-in while the header (which reads the URL and session) streams in. Same size, no shift. */
export function SiteHeaderFallback() {
  return (
    <header className="on-board sticky top-0 z-40 border-b border-board-line bg-board text-on-board">
      <div className="wrap flex h-(--header-h) items-center gap-4">
        <Link href="/" className="shrink-0 rounded-xs" aria-label="KejaLink home">
          <Wordmark />
        </Link>
        <nav aria-label="Main" className="ml-4 hidden items-center gap-5 md:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center px-1 font-bold text-on-board-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <span aria-hidden className="ml-auto h-9 w-24 rounded-sm bg-board-2" />
      </div>
    </header>
  );
}
