"use client";

import { Bookmark } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { useCanSave, useSavedIds, useToggleSaved } from "@/lib/saved";

const base =
  "relative z-10 grid size-11 shrink-0 place-items-center rounded-sm text-accent transition-colors hover:bg-accent-soft " +
  "[&_svg]:size-5";

/**
 * The bookmark on a listing (references R1 and R2): orange outline, filled once saved.
 * Signed-out visitors are sent to sign in and come back here; listers and admins don't see it.
 */
export function SaveButton({ propertyId, title, className }: { propertyId: string; title: string; className?: string }) {
  const { signedIn, canSave, pending } = useCanSave();
  const saved = useSavedIds();
  const toggle = useToggleSaved();
  const pathname = usePathname();
  const search = useSearchParams();

  if (pending || (signedIn && !canSave)) return null;

  if (!signedIn) {
    const next = `${pathname}${search.size ? `?${search}` : ""}`;
    return (
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className={cn(base, className)}
        aria-label={`Sign in to save ${title}`}
      >
        <Bookmark aria-hidden />
      </Link>
    );
  }

  const isSaved = saved.data?.has(propertyId) ?? false;
  return (
    <button
      type="button"
      className={cn(base, className)}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${title} from saved` : `Save ${title}`}
      disabled={saved.isPending}
      onClick={() => toggle.mutate({ propertyId, save: !isSaved })}
    >
      <Bookmark aria-hidden className={cn(isSaved && "fill-current")} />
    </button>
  );
}
