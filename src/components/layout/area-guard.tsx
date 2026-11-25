import { ServerCrash } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StateBlock } from "@/components/ui/state";
import { isApiError } from "@/lib/api/errors";
import type { UserRole } from "@/lib/api/schemas/common";
import { requireRole } from "@/lib/auth/guard";
import { AreaShell } from "./area-shell";
import { WakingNotice } from "./waking";

/**
 * Authoritative server-side check for an area (get-session). Redirects are thrown by
 * requireRole; an unreachable API renders a calm retry state instead of an error page.
 */
export async function AreaGuard({ role, children }: { role: UserRole; children: ReactNode }) {
  try {
    await requireRole(role);
  } catch (error) {
    if (!isApiError(error)) throw error; // redirect() and notFound() pass through
    return (
      <div className="wrap py-12">
        <StateBlock
          icon={ServerCrash}
          title="We couldn't check your sign-in"
          action={
            <Button asChild variant="board">
              <Link href={role === "SEEKER" ? "/seeker" : role === "TENANT" ? "/tenant" : "/admin"}>
                Try again
              </Link>
            </Button>
          }
        >
          <p>
            The server didn&apos;t answer in time. It may be waking up after a quiet spell; try again in a
            moment.
          </p>
        </StateBlock>
      </div>
    );
  }
  return <AreaShell role={role}>{children}</AreaShell>;
}

export function AreaFallback() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="h-12 border-b border-line bg-surface-2" />
      <div className="wrap grid gap-6 py-10">
        <Skeleton className="h-12 w-64" />
        <WakingNotice />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
