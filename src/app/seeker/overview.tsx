"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { RequestCard } from "@/components/domain/booking-bits";
import { ListLoading, QueryError } from "@/components/domain/query-states";
import { StatusBoard } from "@/components/domain/status-board";
import { PageTitle } from "@/components/layout/area-shell";
import { Button } from "@/components/ui/button";
import { StateBlock } from "@/components/ui/state";
import { keys, listMyBookings } from "@/lib/api/resources";
import { useSession } from "@/lib/auth/client";

const total = async (status: "PENDING" | "CONFIRMED") =>
  (await listMyBookings(status, 1, 1)).meta?.total ?? 0;

export function SeekerOverview() {
  const { data: session } = useSession();
  const first = session?.user.name.split(" ")[0];
  const latest = useQuery({ queryKey: keys.myBookings(null, 1), queryFn: () => listMyBookings(null, 1) });
  const recent = latest.data?.data.slice(0, 3) ?? [];

  return (
    <>
      <PageTitle
        title={first ? `Habari, ${first}` : "Your requests"}
        action={
          <Button asChild variant="band">
            <Link href="/properties">
              <Search aria-hidden />
              Find a place
            </Link>
          </Button>
        }
      >
        <p>Every request you send waits here for a clear answer.</p>
      </PageTitle>

      <div className="grid gap-8 lg:grid-cols-[22rem_1fr] lg:gap-12">
        <StatusBoard
          title="Your requests"
          rows={[
            {
              label: "Waiting for an answer",
              href: "/seeker/requests?status=PENDING",
              queryKey: keys.pendingCount("mine"),
              count: () => total("PENDING"),
            },
            {
              label: "Confirmed",
              href: "/seeker/requests?status=CONFIRMED",
              queryKey: ["bookings", "mine", "confirmed-count"],
              count: () => total("CONFIRMED"),
              attention: true,
            },
          ]}
        />

        <section aria-labelledby="recent-title" className="grid content-start gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="recent-title" className="board-type text-step-3">
              Latest
            </h2>
            <Link href="/seeker/requests" className="link inline-flex min-h-11 items-center gap-1 font-bold">
              All requests
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          {latest.isPending ? (
            <ListLoading rows={2} />
          ) : latest.isError ? (
            <QueryError
              error={latest.error}
              retry={() => void latest.refetch()}
              retrying={latest.isFetching}
            />
          ) : recent.length === 0 ? (
            <StateBlock
              icon={Search}
              title="No requests yet"
              headingLevel="h3"
              action={
                <Button asChild variant="board">
                  <Link href="/properties">Browse places</Link>
                </Button>
              }
            >
              <p>Find a place you like and tap “Request a viewing”. It shows up here with its status.</p>
            </StateBlock>
          ) : (
            <ul className="grid gap-4">
              {recent.map((booking) => (
                <li key={booking.id}>
                  <RequestCard
                    booking={booking}
                    perspective="seeker"
                    href={`/seeker/requests/${booking.id}`}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
