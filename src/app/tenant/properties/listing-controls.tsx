"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "radix-ui";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { messageFor } from "@/lib/api/errors";
import { deleteProperty, keys, updateProperty } from "@/lib/api/resources";
import { cn } from "@/lib/cn";

const useInvalidateListing = (id: string) => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: keys.property(id) }),
      queryClient.invalidateQueries({ queryKey: keys.myPropertiesAll }),
      queryClient.invalidateQueries({ queryKey: ["bookings"] }),
    ]);
};

/** Keep availability true: one switch, with the API's rule (a confirmed booking blocks "available") explained. */
export function AvailabilitySwitch({ id, isAvailable }: { id: string; isAvailable: boolean }) {
  const labelId = useId();
  const invalidate = useInvalidateListing(id);
  const mutation = useMutation({
    mutationFn: (next: boolean) => updateProperty(id, { isAvailable: next }),
    onSuccess: async ({ data }) => {
      await invalidate();
      toast.success(data.isAvailable ? "Marked as available" : "Marked as taken");
    },
    onError: (error) => toast.error(messageFor(error)),
  });
  const checked = mutation.isPending && mutation.variables !== undefined ? mutation.variables : isAvailable;
  return (
    <div className="flex items-center gap-3">
      <Switch.Root
        aria-labelledby={labelId}
        checked={checked}
        disabled={mutation.isPending}
        onCheckedChange={(next) => mutation.mutate(next)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-pill border-2 transition-colors disabled:opacity-60",
          "before:absolute before:-inset-2 before:content-['']",
          checked ? "border-ink bg-primary" : "border-line-strong bg-surface-sunk",
        )}
      >
        <Switch.Thumb
          className={cn(
            "block size-5 rounded-pill bg-ink shadow-1 transition-transform duration-(--dur-2) ease-out",
            checked ? "translate-x-[1.35rem]" : "translate-x-0.5",
          )}
        />
      </Switch.Root>
      <span id={labelId} className="font-bold">
        {checked ? "Available" : "Taken"}
        <span className="sr-only"> (switch availability)</span>
      </span>
    </div>
  );
}

/** Delete with the consequences spelled out (pending requests are declined; confirmed ones block it). */
export function DeleteListing({ id, title, redirectTo }: { id: string; title: string; redirectTo?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const invalidate = useInvalidateListing(id);
  const mutation = useMutation({
    mutationFn: () => deleteProperty(id),
    onSuccess: async () => {
      setOpen(false);
      await invalidate();
      toast.success("Listing deleted");
      if (redirectTo) router.push(redirectTo);
    },
  });
  return (
    <>
      <Button variant="danger-quiet" size="sm" onClick={() => setOpen(true)}>
        <Trash2 aria-hidden />
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this listing?"
        confirmLabel="Delete listing"
        cancelLabel="Keep listing"
        pending={mutation.isPending}
        error={mutation.error ? messageFor(mutation.error) : null}
        onConfirm={() => mutation.mutate()}
      >
        <p>&ldquo;{title}&rdquo; disappears from search straight away.</p>
        <ul className="ml-5 grid list-disc gap-1.5">
          <li>Every pending request for it is declined, with a note that you removed the listing.</li>
          <li>
            If someone has a confirmed booking, you can&apos;t delete it. Sort that out with them first.
          </li>
        </ul>
      </ConfirmDialog>
    </>
  );
}
