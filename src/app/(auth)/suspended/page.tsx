import { Ban } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supportEmail } from "@/lib/env/public";

export const metadata: Metadata = { title: "Account suspended", robots: { index: false } };

export default function SuspendedPage() {
  return (
    <div className="grid gap-5">
      <Ban aria-hidden className="size-10 text-danger" />
      <h1 className="board-type text-step-5">This account is on hold</h1>
      <p className="text-step-1 text-ink-2">
        An administrator has suspended or banned this account, so it can&apos;t sign in or make changes right
        now. Your listings and requests are hidden while it&apos;s on hold.
      </p>
      <p className="text-ink-2">
        If you think this is a mistake,{" "}
        {supportEmail ? (
          <>
            email{" "}
            <a className="link font-bold" href={`mailto:${supportEmail}?subject=Account%20review`}>
              {supportEmail}
            </a>{" "}
            from the address on the account and we&apos;ll take a look.
          </>
        ) : (
          "contact KejaLink support from the address on the account and we'll take a look."
        )}
      </p>
      <div>
        <Button asChild size="lg">
          <Link href="/properties">Keep browsing places</Link>
        </Button>
      </div>
    </div>
  );
}
