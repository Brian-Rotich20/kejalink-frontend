import type { Metadata } from "next";
import Link from "next/link";
import { BookingStatusPlate } from "@/components/domain/status";
import { ProsePage } from "@/components/layout/prose-page";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How viewing requests work on KejaLink: pending, confirmed, declined or cancelled, and why you pay only after viewing.",
};

export default function HowItWorksPage() {
  return (
    <ProsePage
      title="How it works"
      intro={
        <p>
          KejaLink runs on one simple rule: every request gets a clear answer, and only one person gets the
          place.
        </p>
      }
    >
      <section>
        <h2>If you&apos;re looking for a place</h2>
        <ul>
          <li>
            Search by area, county, type and budget. Every listing shows its monthly rent and whether
            it&apos;s free.
          </li>
          <li>Request a viewing. Add when you&apos;d like to move in and a short message about yourself.</li>
          <li>
            Your request is Pending until the person listing answers. You can cancel it any time before then.
          </li>
          <li>
            When they confirm, you see their email so you can arrange the viewing. If they decline,
            you&apos;ll see their reason when they give one.
          </li>
          <li>View the house in person. Pay only after you&apos;ve seen it.</li>
        </ul>
      </section>
      <section>
        <h2>What each status means</h2>
        <dl className="grid gap-4">
          {(
            [
              ["PENDING", "Sent, waiting for an answer. Nothing is agreed yet."],
              [
                "CONFIRMED",
                "The person listing chose you. Their email appears so you can arrange the viewing. The place shows as taken for everyone else.",
              ],
              [
                "REJECTED",
                "Not this time. Another request may have been confirmed, or the listing was removed.",
              ],
              [
                "CANCELLED",
                "You (or an admin) withdrew it. If a confirmed booking is cancelled, the place becomes available again.",
              ],
            ] as const
          ).map(([status, text]) => (
            <div key={status} className="grid gap-1.5">
              <dt>
                <BookingStatusPlate status={status} />
              </dt>
              <dd className="text-ink-2">{text}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section>
        <h2>If you&apos;re listing a place</h2>
        <ul>
          <li>Create a listing from your phone: rent, area, type, a description and up to 10 photos.</li>
          <li>Requests arrive with the seeker&apos;s name, email, preferred move-in date and message.</li>
          <li>
            Confirm one request and the other pending requests for that place are declined automatically, with
            a polite note. Your place is then marked as taken.
          </li>
          <li>Decline with a short reason so people know where they stand.</li>
          <li>You can switch a place back to available any time there&apos;s no confirmed booking on it.</li>
        </ul>
      </section>
      <section>
        <h2>Staying safe</h2>
        <ul>
          <li>Never pay a viewing fee, or a deposit to hold a place you haven&apos;t seen.</li>
          <li>Meet at the house, in daylight, and take a friend if you can.</li>
          <li>Pay to an account in the landlord&apos;s or agent&apos;s name, and keep the receipt.</li>
          <li>If something feels off, stop and tell us.</li>
        </ul>
      </section>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="band" size="lg">
          <Link href="/properties">Browse places</Link>
        </Button>
        <Button asChild size="lg">
          <Link href="/register?as=tenant">List a place</Link>
        </Button>
      </div>
    </ProsePage>
  );
}
