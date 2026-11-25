"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, CircleCheck, Lock, Pencil, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AvailabilityPlate } from "@/components/domain/status";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ApiError, messageFor } from "@/lib/api/errors";
import { createBooking } from "@/lib/api/resources";
import type { Booking } from "@/lib/api/schemas/booking";
import { useSession } from "@/lib/auth/client";
import { loginHref } from "@/lib/auth/roles";
import { formatAmount, todayInNairobi } from "@/lib/format";

type Props = {
  propertyId: string;
  tenantId: string;
  isAvailable: boolean;
  priceAmount: number;
  area: string;
};

function RequestForm({ propertyId, onDone }: { propertyId: string; onDone: (booking: Booking) => void }) {
  const queryClient = useQueryClient();
  const [moveIn, setMoveIn] = useState("");
  const [message, setMessage] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const today = todayInNairobi();

  const mutation = useMutation({
    mutationFn: () =>
      createBooking({
        propertyId,
        ...(moveIn ? { preferredMoveInDate: moveIn } : {}),
        ...(message.trim() ? { message: message.trim() } : {}),
      }),
    onSuccess: ({ data }) => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      onDone(data);
    },
  });

  const error = mutation.error instanceof ApiError ? mutation.error : null;
  const dateError = clientError ?? error?.fieldError("preferredMoveInDate");

  return (
    <form
      noValidate
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (moveIn && moveIn < today) {
          setClientError("Pick today or a later date.");
          return;
        }
        setClientError(null);
        mutation.mutate();
      }}
    >
      <Field label="When would you like to move in?" optional error={dateError}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="date"
            min={today}
            value={moveIn}
            onChange={(e) => setMoveIn(e.target.value)}
            aria-describedby={describedBy}
            aria-invalid={invalid}
          />
        )}
      </Field>
      <Field
        label="Message"
        optional
        hint="Introduce yourself: who you are, when you can view."
        error={error?.fieldError("message")}
      >
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            value={message}
            maxLength={1000}
            onChange={(e) => setMessage(e.target.value)}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            placeholder="Hi, I'm a student at KU and can view on Saturday morning."
          />
        )}
      </Field>
      {error && error.code !== "VALIDATION_ERROR" ? (
        <div role="alert" className="grid gap-2 rounded-sm bg-danger-soft p-3 text-danger">
          <p className="font-bold">{messageFor(error)}</p>
          {error.code === "DUPLICATE_BOOKING" ? (
            <Link href="/seeker/requests?status=PENDING" className="link font-bold">
              See your pending requests
            </Link>
          ) : null}
          {error.code === "PROPERTY_NOT_AVAILABLE" ? (
            <Link href="/properties?available=true" className="link font-bold">
              Find places that are still free
            </Link>
          ) : null}
        </div>
      ) : null}
      <Button type="submit" variant="band" size="lg" block loading={mutation.isPending}>
        {mutation.isPending ? "Sending request" : "Request a viewing"}
      </Button>
      <p className="flex gap-2 text-step--1 text-ink-3">
        <Lock aria-hidden className="mt-0.5 size-4 shrink-0" />
        The person listing sees your name, email and message. Their email reaches you once they confirm.
      </p>
    </form>
  );
}

function Sent({ booking }: { booking: Booking }) {
  return (
    <div role="status" className="grid gap-3">
      <p className="flex items-center gap-2 text-step-1 font-bold text-success">
        <CircleCheck aria-hidden className="size-6" />
        Request sent
      </p>
      <p className="text-ink-2">
        It&apos;s pending until the person listing answers. You&apos;ll see their reply in your requests, and
        their email once they confirm.
      </p>
      <Button asChild variant="board" block>
        <Link href={`/seeker/requests/${booking.id}`}>Track this request</Link>
      </Button>
    </div>
  );
}

/** What to do here, for whoever is looking. */
function PanelBody(props: Props & { onSent: (b: Booking) => void; sent: Booking | null }) {
  const { data, isPending } = useSession();
  const user = data?.user;
  const here = `/properties/${props.propertyId}`;

  if (props.sent) return <Sent booking={props.sent} />;

  if (isPending) {
    return (
      <div
        aria-hidden
        className="h-40 animate-[skeleton_1.6s_var(--ease-in-out)_infinite] rounded-sm bg-surface-sunk"
      />
    );
  }

  if (!props.isAvailable) {
    return (
      <div className="grid gap-3">
        <p className="font-bold">Someone else got this one.</p>
        <p className="text-ink-2">
          This place is taken, so it can&apos;t take requests right now. It shows as available again if the
          booking falls through.
        </p>
        <Button asChild variant="board" block>
          <Link href={`/properties?area=${encodeURIComponent(props.area)}&available=true`}>
            Find free places in {props.area}
          </Link>
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid gap-3">
        <p className="text-ink-2">
          Sign in to ask for a viewing. It takes a minute, and you&apos;ll come straight back here.
        </p>
        <Button asChild variant="band" size="lg" block>
          <Link href={loginHref(here)}>Sign in to request a viewing</Link>
        </Button>
        <p className="text-center text-step--1 text-ink-2">
          New here?{" "}
          <Link className="link font-bold" href={`/register?as=seeker&next=${encodeURIComponent(here)}`}>
            Create an account
          </Link>
        </p>
      </div>
    );
  }

  if (user.id === props.tenantId) {
    return (
      <div className="grid gap-3">
        <p className="text-ink-2">This is your listing. Seekers request viewings from here.</p>
        <Button asChild variant="board" block>
          <Link href={`/tenant/properties/${props.propertyId}`}>
            <Pencil aria-hidden />
            Manage this listing
          </Link>
        </Button>
      </div>
    );
  }

  if (user.role !== "SEEKER") {
    return (
      <p className="text-ink-2">
        {user.role === "ADMIN"
          ? "You're signed in as an admin. Viewing requests come from seeker accounts."
          : "You're signed in as a lister. To request viewings, use a seeker account."}
      </p>
    );
  }

  return <RequestForm propertyId={props.propertyId} onDone={props.onSent} />;
}

/**
 * Desktop: a sticky side column. Phones: a bar fixed in thumb reach with the rent and the action,
 * opening the same panel as a bottom sheet.
 */
export function BookingPanel(props: Props) {
  const [sent, setSent] = useState<Booking | null>(null);
  const [sheet, setSheet] = useState(false);
  const body = <PanelBody {...props} sent={sent} onSent={setSent} />;
  const price = (compact: boolean) => (
    <p className="flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="board-type-wide text-step--1 text-ink-2">KES</span>
      <span className={compact ? "board-type text-step-3" : "board-type text-step-4"}>
        {formatAmount(props.priceAmount)}
      </span>
      <span className="text-step--1 text-ink-3">{compact ? "/ mo" : "/ month"}</span>
    </p>
  );

  return (
    <>
      <section
        aria-labelledby="request-title"
        className="hidden rounded-md border border-line bg-surface-2 shadow-1 lg:grid lg:gap-4 lg:p-5"
      >
        <div className="grid justify-items-start gap-2">
          <AvailabilityPlate available={props.isAvailable} />
          {price(false)}
        </div>
        <h2 id="request-title" className="flex items-center gap-2 font-bold">
          <CalendarClock aria-hidden className="size-5" />
          Request a viewing
        </h2>
        {body}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface-2/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="wrap flex items-center justify-between gap-3 py-3">
          {price(true)}
          <Dialog open={sheet} onOpenChange={setSheet}>
            <DialogTrigger asChild>
              <Button variant={props.isAvailable ? "band" : "board"} className="shrink-0">
                {props.isAvailable ? "Request a viewing" : "It's taken"}
              </Button>
            </DialogTrigger>
            <DialogContent
              variant="sheet"
              title="Request a viewing"
              description={`KES ${formatAmount(props.priceAmount)} a month`}
            >
              {body}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}

export function SafetyTips() {
  return (
    <section
      aria-labelledby="safety-title"
      className="grid gap-3 rounded-md border border-warning/40 bg-warning-soft p-5"
    >
      <h2 id="safety-title" className="flex items-center gap-2 font-bold text-ink">
        <ShieldAlert aria-hidden className="size-5 text-warning" />
        Before you pay anything
      </h2>
      <ul className="grid gap-2 text-ink-2">
        {[
          "View the house in person first. Pay only after you've seen it.",
          "Never pay a viewing fee or a deposit to “hold” a place.",
          "Pay to an account in the landlord's or agent's name, and get a receipt.",
        ].map((tip) => (
          <li key={tip} className="flex gap-2">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-2" />
            {tip}
          </li>
        ))}
      </ul>
    </section>
  );
}
