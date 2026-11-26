"use client";

import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { UserRole } from "@/lib/api/schemas/common";
import { ROLE_HOME } from "@/lib/auth/roles";
import { NavLink, type NavItem } from "./nav-link";

/**
 * The phone menu sheet. Loaded on first open (next/dynamic), so the dialog code never ships
 * with the first paint. Radix returns focus to the menu button when it closes.
 */
export default function MobileMenu({
  open,
  onOpenChange,
  nav,
  role,
  userName,
  onSignOut,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nav: NavItem[];
  role: UserRole | null;
  userName: string | null;
  onSignOut: () => void;
}) {
  const close = () => onOpenChange(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="sheet" title="Menu">
        <nav aria-label="Main" className="grid">
          {nav.map((item) => (
            <NavLink key={item.href} item={item} large onClick={close} />
          ))}
          {role ? (
            <NavLink item={{ href: `${ROLE_HOME[role]}/account`, label: "Account" }} large onClick={close} />
          ) : (
            <NavLink item={{ href: "/how-it-works", label: "How it works" }} large onClick={close} />
          )}
        </nav>
        <div className="mt-6 grid gap-3">
          {userName ? (
            <>
              <p className="flex items-center gap-3 text-ink-2">
                <UserRound aria-hidden className="size-5" />
                Signed in as <strong className="text-ink">{userName}</strong>
              </p>
              <Button block onClick={onSignOut}>
                <LogOut aria-hidden />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="band" block size="lg">
                <Link href="/login" onClick={close}>
                  Sign in
                </Link>
              </Button>
              <Button asChild block size="lg">
                <Link href="/register?as=tenant" onClick={close}>
                  List a place
                </Link>
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
