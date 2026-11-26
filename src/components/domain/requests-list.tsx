"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import Link from "next/link";
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Textarea } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { StateBlock } from "@/components/ui/state";
import { messageFor } from "@/lib/api/errors";
import {
  cancelBooking,
  confirmBooking,
  keys,
  listMyBookings,
  listReceivedBookings,
  rejectBooking,
} from "@/lib/api/resources";
import type { Booking, BookingStatus } from "@/lib/api/schemas/booking";
import { cn } from "@/lib/cn";
import { RequestCard } from "./booking-bits";
import { ListLoading, QueryError } from "./query-states";

const STATUSES = ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"] as const;
const TAB_LABEL: Record<BookingStatus | "ALL", string> = {
  ALL: "All",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  REJECTED: "Declined",
  CANCELLED: "Cancelled",
};

export const requestFilterParsers = {
  status: parseAsStringLiteral(STATUSES),
  page: parseAsInteger.withDefault(1),
};

/** Mutations that change bookings refresh every list, count and detail that could show them. */
export function useInvalidateBookings() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["bookings"] }),
      queryClient.invalidateQueries({ queryKey: ["properties"] }),
    ]);
}

/* ------------------------------ actions ------------------------------ */

export function CancelRequest({ booking, onDone }: { booking: Booking; onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const invalidate = useInvalidateBookings();
  const mutation = useMutation({
    mutationFn: () => cancelBooking(booking.id),
    onSuccess: async () => {
      await invalidate();
      setOpen(false);
      toast.success("Request cancelled");
      onDone?.();
    },
  });
  const confirmed = booking.status === "CONFIRMED";
  return (
    <>
      <Button variant="danger-quiet" size="sm" onClick={() => setOpen(true)}>
        Cancel request
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Cancel this request?"
        confirmLabel="Cancel request"
        cancelLabel="Keep request"
        pending={mutation.isPending}
        error={mutation.error ? messageFor(mutation.error) : null}
        onConfirm={() => mutation.mutate()}
      >
        <p>
          {confirmed
            ? `This was already confirmed. Cancelling frees the place for other people, and ${booking.tenant.name} will see that you cancelled.`
            : `${booking.tenant.name} won't be able to confirm it any more. You can send a new request later if the place is still free.`}
        </p>
      </ConfirmDialog>
    </>
  );
}

export function ConfirmRequest({ booking, onDone }: { booking: Booking; onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const invalidate = useInvalidateBookings();
  const mutation = useMutation({
    mutationFn: () => confirmBooking(booking.id),
    onSuccess: async () => {
      await invalidate();
      setOpen(false);
      toast.success(`Confirmed ${booking.seeker.name}`, {
        description: "Your place now shows as taken. Other pending requests were declined.",
      });
      onDone?.();
    },
  });
  return (
    <>
      <Button variant="band" size="sm" onClick={() => setOpen(true)}>
        Confirm
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Confirm ${booking.seeker.name}?`}
        tone="band"
        confirmLabel="Confirm request"
        cancelLabel="Not yet"
        pending={mutation.isPending}
        error={mutation.error ? messageFor(mutation.error) : null}
        onConfirm={() => mutation.mutate()}
      >
        <p>Confirming this request will:</p>
        <ul className="ml-5 grid list-disc gap-1.5">
          <li>share your email with {booking.seeker.name} so you can arrange the viewing;</li>
          <li>mark &ldquo;{booking.property.title}&rdquo; as taken;</li>
          <li>decline every other pending request for this place, with a polite note.</li>
        </ul>
      </ConfirmDialog>
    </>
  );
}

export function DeclineRequest({ booking, onDone }: { booking: Booking; onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const invalidate = useInvalidateBookings();
  const mutation = useMutation({
    mutationFn: () => rejectBooking(booking.id, reason.trim() || undefined),
    onSuccess: async () => {
      await invalidate();
      setOpen(false);
      setReason("");
      toast.success("Request declined");
      onDone?.();
    },
  });
  return (
    <>
      <Button variant="danger-quiet" size="sm" onClick={() => setOpen(true)}>
        Decline
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Decline ${booking.seeker.name}?`}
        confirmLabel="Decline request"
        cancelLabel="Keep it pending"
        pending={mutation.isPending}
        error={mutation.error ? messageFor(mutation.error) : null}
        onConfirm={() => mutation.mutate()}
      >
        <p>{booking.seeker.name} will see that you declined, and the reason if you give one.</p>
        <Field label="Reason" optional hint="For example: “Already promised to someone else.”">
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
            />
          )}
        </Field>
      </ConfirmDialog>
    </>
  );
}

/* ------------------------------- list ------------------------------- */

export function RequestsList({ perspective }: { perspective: "seeker" | "tenant" }) {
  const [{ status, page }, setFilters] = useQueryStates(requestFilterParsers, { history: "push" });
  const list = perspective === "seeker" ? listMyBookings : listReceivedBookings;
  const query = useQuery({
    queryKey: perspective === "seeker" ? keys.myBookings(status, page) : keys.receivedBookings(status, page),
    queryFn: () => list(status, page),
    placeholderData: keepPreviousData,
  });
  const base = perspective === "seeker" ? "/seeker/requests" : "/tenant/requests";
  const bookings = query.data?.data ?? [];

  return (
    <div className="grid gap-5">
      <div
        role="group"
        aria-label="Filter by status"
        className="-mx-(--gutter) flex [scrollbar-width:none] gap-1 overflow-x-auto border-b border-line px-(--gutter) md:mx-0 md:px-0"
      >
        {(["ALL", ...STATUSES] as const).map((tab) => {
          const selected = (status ?? "ALL") === tab;
          return (
            <button
              key={tab}
              type="button"
              aria-pressed={selected}
              onClick={() => void setFilters({ status: tab === "ALL" ? null : tab, page: null })}
              className={cn(
                "-mb-px inline-flex min-h-11 shrink-0 items-center border-b-[3px] px-3 font-bold transition-colors",
                selected ? "border-ink text-ink" : "border-transparent text-ink-2 hover:text-ink",
              )}
            >
              {TAB_LABEL[tab]}
            </button>
          );
        })}
      </div>

      <section aria-label={`${TAB_LABEL[status ?? "ALL"]} requests`} className="grid gap-4">
        {query.isPending ? (
          <ListLoading />
        ) : query.isError ? (
          <QueryError error={query.error} retry={() => void query.refetch()} retrying={query.isFetching} />
        ) : bookings.length === 0 ? (
          <StateBlock
            icon={Inbox}
            title={status ? `No ${TAB_LABEL[status].toLowerCase()} requests` : "No requests yet"}
            action={
              perspective === "seeker" ? (
                <Button asChild variant="board">
                  <Link href="/properties">Browse places</Link>
                </Button>
              ) : (
                <Button asChild variant="board">
                  <Link href="/tenant/properties">Check your listings</Link>
                </Button>
              )
            }
          >
            <p>
              {perspective === "seeker"
                ? "When you request a viewing, it shows up here with its status."
                : "When someone asks to view one of your places, their request lands here."}
            </p>
          </StateBlock>
        ) : (
          <>
            <ul className={cn("grid gap-4 transition-opacity", query.isPlaceholderData && "opacity-60")}>
              {bookings.map((booking) => (
                <li key={booking.id}>
                  <RequestCard
                    booking={booking}
                    perspective={perspective}
                    href={`${base}/${booking.id}`}
                    actions={
                      perspective === "tenant" && booking.status === "PENDING" ? (
                        <>
                          <ConfirmRequest booking={booking} />
                          <DeclineRequest booking={booking} />
                        </>
                      ) : perspective === "seeker" &&
                        (booking.status === "PENDING" || booking.status === "CONFIRMED") ? (
                        <CancelRequest booking={booking} />
                      ) : undefined
                    }
                  />
                </li>
              ))}
            </ul>
            <Pagination
              page={page}
              totalPages={query.data?.meta?.totalPages ?? 1}
              onPage={(next) => void setFilters({ page: next })}
              disabled={query.isFetching}
            />
          </>
        )}
      </section>
    </div>
  );
}
