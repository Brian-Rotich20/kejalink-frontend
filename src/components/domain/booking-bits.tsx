"use client";

import { CalendarDays, Check, Copy, Mail, MessageSquareText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/lib/api/schemas/booking";
import { cn } from "@/lib/cn";
import { cropTo } from "@/lib/cloudinary";
import { formatDateOnly, formatDateTime, formatKes, formatRelative } from "@/lib/format";
import { BookingStatusPlate } from "./status";

type Perspective = "seeker" | "tenant" | "admin";

/** One request in a list: the place, the status, who and when. Actions go in `actions`. */
export function RequestCard({
  booking,
  perspective,
  href,
  actions,
}: {
  booking: Booking;
  perspective: Perspective;
  href: string;
  actions?: ReactNode;
}) {
  const other = perspective === "seeker" ? booking.tenant : booking.seeker;
  return (
    <article className="group pull-in relative grid gap-4 rounded-md border border-line bg-surface-2 p-4 transition-[border-color,box-shadow] focus-within:border-ink hover:border-line-strong hover:shadow-1 sm:grid-cols-[7.5rem_1fr] sm:p-5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface-sunk max-sm:hidden">
        {booking.property.primaryImageUrl ? (
          <Image
            src={cropTo(booking.property.primaryImageUrl, "4:3")}
            alt=""
            fill
            sizes="120px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="grid min-w-0 gap-3">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="grid min-w-0 gap-0.5">
            <p className="board-type truncate text-step-2">{booking.property.area}</p>
            <h3 className="truncate font-bold">
              <Link
                href={href}
                className="outline-none after:absolute after:inset-0 after:rounded-md focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
              >
                {booking.property.title}
              </Link>
            </h3>
          </div>
          <BookingStatusPlate status={booking.status} />
        </div>
        <dl className="flex flex-wrap gap-x-5 gap-y-1 text-step--1 text-ink-2">
          <div className="flex gap-1">
            <dt className="sr-only">Rent</dt>
            <dd className="font-bold text-ink">{formatKes(booking.property.priceAmount)}/mo</dd>
          </div>
          <div className="flex items-center gap-1">
            <dt>
              <CalendarDays aria-hidden className="size-4" />
              <span className="sr-only">Move-in</span>
            </dt>
            <dd>
              {booking.preferredMoveInDate
                ? `Move in ${formatDateOnly(booking.preferredMoveInDate)}`
                : "Move-in date open"}
            </dd>
          </div>
          <div className="flex gap-1">
            <dt className="sr-only">Sent</dt>
            <dd>
              <time dateTime={booking.createdAt} title={formatDateTime(booking.createdAt)}>
                Sent {formatRelative(booking.createdAt)}
              </time>
            </dd>
          </div>
        </dl>
        {perspective !== "seeker" ? (
          <div className="flex items-center gap-3 text-step--1">
            <Avatar name={other.name} size="sm" />
            <span>
              <strong>{other.name}</strong>
              {"email" in other && other.email ? <span className="text-ink-2"> · {other.email}</span> : null}
            </span>
          </div>
        ) : null}
        {perspective === "tenant" && booking.message ? (
          <p className="flex gap-2 rounded-sm bg-surface-sunk p-3 text-step--1 text-ink-2">
            <MessageSquareText aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span className="line-clamp-3">{booking.message}</span>
          </p>
        ) : null}
        {booking.decisionReason && booking.status !== "PENDING" ? (
          <p className="text-step--1 text-ink-2">
            <span className="font-bold">Reason:</span> {booking.decisionReason}
          </p>
        ) : null}
        {actions ? <div className="relative z-10 flex flex-wrap gap-2 pt-1">{actions}</div> : null}
      </div>
    </article>
  );
}

/** Sent → answered (or withdrawn). Every step is text, never colour alone. */
export function BookingTimeline({ booking }: { booking: Booking }) {
  const steps: { label: string; at: string | null; done: boolean; note?: string | null }[] = [
    { label: "Request sent", at: booking.createdAt, done: true },
  ];
  if (booking.status === "PENDING") {
    steps.push({ label: "Waiting for an answer", at: null, done: false });
  } else if (booking.status === "CONFIRMED") {
    steps.push({ label: "Confirmed", at: booking.decidedAt, done: true });
    steps.push({ label: "View the house, then agree terms", at: null, done: false });
  } else if (booking.status === "REJECTED") {
    steps.push({ label: "Declined", at: booking.decidedAt, done: true, note: booking.decisionReason });
  } else {
    steps.push({ label: "Cancelled", at: booking.updatedAt, done: true, note: booking.decisionReason });
  }
  return (
    <ol className="grid gap-0">
      {steps.map((step, i) => (
        <li key={step.label} className="relative grid grid-cols-[1.75rem_1fr] gap-3 pb-5 last:pb-0">
          {i < steps.length - 1 ? (
            <span aria-hidden className="absolute top-7 bottom-0 left-[0.8125rem] w-0.5 bg-line" />
          ) : null}
          <span
            aria-hidden
            className={cn(
              "grid size-7 place-items-center rounded-pill border-2",
              step.done ? "border-ink bg-ink text-paper" : "border-dashed border-line-strong bg-surface-2",
            )}
          >
            {step.done ? <Check className="size-4" strokeWidth={3} /> : null}
          </span>
          <div className="grid gap-0.5 pt-0.5">
            <p className="font-bold">
              {step.label}
              {!step.done ? <span className="sr-only"> (not yet)</span> : null}
            </p>
            {step.at ? (
              <time className="text-step--1 text-ink-2" dateTime={step.at}>
                {formatDateTime(step.at)}
              </time>
            ) : null}
            {step.note ? <p className="text-step--1 text-ink-2">Reason: {step.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** The lister's email, revealed after confirmation, with copy and email actions. */
export function ContactReveal({ name, email }: { name: string; email: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="grid gap-3 rounded-md border border-success/40 bg-success-soft p-4">
      <p className="font-bold text-success">Confirmed. Here&apos;s how to reach {name}.</p>
      <p className="board-type-wide text-step-1 break-all text-ink normal-case">{email}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(email);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? "Copied" : "Copy email"}
        </Button>
        <Button asChild variant="board">
          <a href={`mailto:${email}?subject=${encodeURIComponent("Viewing on KejaLink")}`}>
            <Mail aria-hidden />
            Email {name.split(" ")[0]}
          </a>
        </Button>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {copied ? "Email copied" : ""}
      </p>
    </div>
  );
}
