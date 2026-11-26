"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, MessageSquareText, SearchX, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StateBlock } from "@/components/ui/state";
import { isApiError } from "@/lib/api/errors";
import { getBooking, keys } from "@/lib/api/resources";
import { formatDateOnly, formatKes } from "@/lib/format";
import { BookingTimeline, ContactReveal } from "./booking-bits";
import { PhotoFrame } from "./property-plate";
import { ListLoading, QueryError } from "./query-states";
import { CancelRequest, ConfirmRequest, DeclineRequest } from "./requests-list";
import { AvailabilityPlate, BookingStatusPlate } from "./status";

export function BookingDetail({
  id,
  perspective,
}: {
  id: string;
  perspective: "seeker" | "tenant" | "admin";
}) {
  const query = useQuery({ queryKey: keys.booking(id), queryFn: () => getBooking(id) });
  const back =
    perspective === "seeker"
      ? "/seeker/requests"
      : perspective === "tenant"
        ? "/tenant/requests"
        : "/admin/bookings";

  const backLink = (
    <Link href={back} className="link inline-flex min-h-11 items-center gap-1.5 font-bold">
      <ArrowLeft aria-hidden className="size-4" />
      All requests
    </Link>
  );

  if (query.isPending) return <ListLoading rows={2} height="h-48" />;
  if (query.isError) {
    if (isApiError(query.error) && (query.error.status === 404 || query.error.status === 422)) {
      return (
        <StateBlock icon={SearchX} title="We couldn't find that request" action={backLink}>
          <p>It may belong to another account, or the link may be wrong.</p>
        </StateBlock>
      );
    }
    return <QueryError error={query.error} retry={() => void query.refetch()} retrying={query.isFetching} />;
  }

  const b = query.data.data;
  const canCancel = perspective === "seeker" && (b.status === "PENDING" || b.status === "CONFIRMED");
  const canAnswer = perspective === "tenant" && b.status === "PENDING";
  const contact =
    perspective === "seeker" && b.status === "CONFIRMED" && b.tenant.email ? b.tenant.email : null;

  return (
    <div className="grid gap-8">
      {backLink}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div className="grid content-start gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="board-type text-step-5">Request</h1>
            <BookingStatusPlate status={b.status} className="text-step-0" />
          </div>

          {contact ? <ContactReveal name={b.tenant.name} email={contact} /> : null}

          {perspective === "seeker" && b.status === "PENDING" ? (
            <p className="rounded-sm bg-warning-soft p-4 text-ink-2">
              Waiting for {b.tenant.name} to answer. You&apos;ll see their email here the moment they confirm.
            </p>
          ) : null}

          <section
            aria-labelledby="timeline-title"
            className="grid gap-4 rounded-md border border-line bg-surface-2 p-5"
          >
            <h2 id="timeline-title" className="font-bold">
              What&apos;s happened
            </h2>
            <BookingTimeline booking={b} />
          </section>

          <section
            aria-labelledby="details-title"
            className="grid gap-4 rounded-md border border-line bg-surface-2 p-5"
          >
            <h2 id="details-title" className="font-bold">
              Details
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1">
                <dt className="flex items-center gap-1.5 text-step--1 text-ink-3">
                  <CalendarDays aria-hidden className="size-4" />
                  Preferred move-in
                </dt>
                <dd className="font-bold">
                  {b.preferredMoveInDate ? formatDateOnly(b.preferredMoveInDate) : "Not given"}
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-step--1 text-ink-3">
                  {perspective === "seeker" ? "Listed by" : "Requested by"}
                </dt>
                <dd className="flex items-center gap-2 font-bold">
                  <Avatar name={perspective === "seeker" ? b.tenant.name : b.seeker.name} size="sm" />
                  {perspective === "seeker" ? b.tenant.name : b.seeker.name}
                </dd>
              </div>
              {perspective !== "seeker" ? (
                <div className="grid gap-1 sm:col-span-2">
                  <dt className="text-step--1 text-ink-3">Seeker&apos;s email</dt>
                  <dd>
                    <a className="link font-bold break-all" href={`mailto:${b.seeker.email}`}>
                      {b.seeker.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {b.message ? (
                <div className="grid gap-1 sm:col-span-2">
                  <dt className="flex items-center gap-1.5 text-step--1 text-ink-3">
                    <MessageSquareText aria-hidden className="size-4" />
                    Message
                  </dt>
                  <dd className="whitespace-pre-line">{b.message}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          {canCancel || canAnswer ? (
            <div className="flex flex-wrap gap-3">
              {canCancel ? <CancelRequest booking={b} /> : null}
              {canAnswer ? (
                <>
                  <ConfirmRequest booking={b} />
                  <DeclineRequest booking={b} />
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="grid content-start gap-5">
          <article className="relative overflow-hidden rounded-md border border-line bg-surface-2">
            <PhotoFrame src={b.property.primaryImageUrl} alt="" sizes="352px" />
            <div className="on-board bg-board px-4 py-3 text-on-board">
              <p className="board-type text-step-2">{b.property.area}</p>
            </div>
            <div className="grid gap-2 p-4">
              <h2 className="font-bold">
                <Link href={`/properties/${b.property.id}`} className="link">
                  {b.property.title}
                </Link>
              </h2>
              <p className="text-ink-2">
                {formatKes(b.property.priceAmount)} a month · {b.property.county}
              </p>
              <AvailabilityPlate available={b.property.isAvailable} />
            </div>
          </article>
          {perspective === "seeker" ? (
            <section
              aria-labelledby="safe-title"
              className="grid gap-2 rounded-md border border-warning/40 bg-warning-soft p-4"
            >
              <h2 id="safe-title" className="flex items-center gap-2 font-bold">
                <ShieldAlert aria-hidden className="size-5 text-warning" />
                Before you pay anything
              </h2>
              <p className="text-step--1 text-ink-2">
                View the house first. Never send a deposit or &ldquo;viewing fee&rdquo; to hold it. Pay to an
                account in the landlord&apos;s or agent&apos;s name, and get a receipt.
              </p>
            </section>
          ) : null}
          {perspective === "seeker" && b.status !== "PENDING" && b.status !== "CONFIRMED" ? (
            <Button asChild variant="board">
              <Link href={`/properties?area=${encodeURIComponent(b.property.area)}&available=true`}>
                Find free places in {b.property.area}
              </Link>
            </Button>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
