import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  AvailabilityPlate,
  BookingStatusPlate,
  PropertyStatusPlate,
  UserStatusPlate,
} from "@/components/domain/status";
import { Wordmark } from "@/components/layout/wordmark";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateOnly, formatKes } from "@/lib/format";
import { DesignInteractive } from "./interactive";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

const COLORS = [
  ["ground", "bg-ground"],
  ["paper", "bg-paper"],
  ["sunk", "bg-sunk"],
  ["line", "bg-line"],
  ["line-strong", "bg-line-strong"],
  ["ink", "bg-ink"],
  ["ink-2", "bg-ink-2"],
  ["ink-3", "bg-ink-3"],
  ["primary", "bg-primary"],
  ["primary-soft", "bg-primary-soft"],
  ["accent", "bg-accent"],
  ["accent-soft", "bg-accent-soft"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["danger", "bg-danger"],
  ["info", "bg-info"],
] as const;

const STEPS = ["step-6", "step-5", "step-4", "step-3", "step-2", "step-1", "step-0", "step--1"] as const;
const STEP_CLASS: Record<(typeof STEPS)[number], string> = {
  "step-6": "text-step-6",
  "step-5": "text-step-5",
  "step-4": "text-step-4",
  "step-3": "text-step-3",
  "step-2": "text-step-2",
  "step-1": "text-step-1",
  "step-0": "text-step-0",
  "step--1": "text-step--1",
};

/** Living style page. Development only: production returns 404. */
export default function DesignPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main id="main" className="wrap grid gap-16 py-12">
      <header className="grid gap-4">
        <Wordmark size="lg" />
        <h1 className="display text-step-6">Nairobi Urban Living</h1>
        <p className="measure text-ink-2">
          Tokens, type and primitives exactly as the app uses them. Development only.
        </p>
      </header>

      <section aria-labelledby="colour" className="grid gap-4">
        <h2 id="colour" className="headline text-step-3">
          Colour
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {COLORS.map(([name, cls]) => (
            <li key={name} className="grid gap-1.5">
              <span className={`h-16 rounded-sm border border-line ${cls}`} />
              <code className="text-step--1 text-ink-2">--{name}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="type" className="grid gap-4">
        <h2 id="type" className="headline text-step-3">
          Type
        </h2>
        <div className="grid gap-3">
          {STEPS.map((step) => (
            <p key={step} className={`headline ${STEP_CLASS[step]}`}>
              A bedsitter near the KU main gate, {formatKes(12500)} a month
            </p>
          ))}
        </div>
        <p className="measure">
          Atkinson Hyperlegible Next sets everything that is read. A request stays pending until the person
          listing says yes or no. Move-in {formatDateOnly("2026-12-01")}.
        </p>
      </section>

      <section aria-labelledby="buttons" className="grid gap-4">
        <h2 id="buttons" className="headline text-step-3">
          Buttons
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Show places</Button>
          <Button variant="secondary">Request a viewing</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="danger">Delete listing</Button>
          <Button variant="danger-quiet">Decline request</Button>
          <Button variant="primary" loading>
            Sending
          </Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg" variant="primary">
            Large
          </Button>
        </div>
      </section>

      <section aria-labelledby="plates" className="grid gap-4">
        <h2 id="plates" className="headline text-step-3">
          Plates
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <BookingStatusPlate status="PENDING" />
          <BookingStatusPlate status="CONFIRMED" />
          <BookingStatusPlate status="REJECTED" />
          <BookingStatusPlate status="CANCELLED" />
          <PropertyStatusPlate status="PUBLISHED" />
          <PropertyStatusPlate status="REJECTED" />
          <UserStatusPlate status="ACTIVE" />
          <UserStatusPlate status="SUSPENDED" />
          <UserStatusPlate status="BANNED" />
          <AvailabilityPlate available />
          <AvailabilityPlate available={false} />
          <Avatar name="Wanjiru Kamau" />
          <Avatar name="Otieno" size="sm" />
        </div>
        <div className="grid max-w-sm gap-2">
          <Skeleton className="aspect-[4/3]" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </section>

      <DesignInteractive />
    </main>
  );
}
