"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { RequestCard } from "@/components/domain/booking-bits";
import { ListLoading, QueryError } from "@/components/domain/query-states";
import { ConfirmRequest, DeclineRequest } from "@/components/domain/requests-list";
import { StatusBoard } from "@/components/domain/status-board";
import { PageTitle } from "@/components/layout/area-shell";
import { Button } from "@/components/ui/button";
import { StateBlock } from "@/components/ui/state";
import { keys, listMyProperties, listReceivedBookings } from "@/lib/api/resources";
import { useSession } from "@/lib/auth/client";

const receivedTotal = async (status: "PENDING" | "CONFIRMED") =>
  (await listReceivedBookings(status, 1, 1)).meta?.total ?? 0;

export function TenantOverview() {
  const { data: session } = useSession();
  const first = session?.user.name.split(" ")[0];
  const pending = useQuery({
    queryKey: keys.receivedBookings("PENDING", 1),
    queryFn: () => listReceivedBookings("PENDING", 1),
  });
  const waiting = pending.data?.data.slice(0, 3) ?? [];

  return (
    <>
      <PageTitle
        title={first ? `Habari, ${first}` : "Your listings"}
        action={
          <Button asChild variant="band">
            <Link href="/tenant/properties/new">
              <Plus aria-hidden />
              List a place
            </Link>
          </Button>
        }
      >
        <p>Answer requests quickly. A clear yes or no is what makes people trust your listing.</p>
      </PageTitle>

      <div className="grid gap-8 lg:grid-cols-[22rem_1fr] lg:gap-12">
        <StatusBoard
          title="Today"
          rows={[
            {
              label: "Requests to answer",
              href: "/tenant/requests?status=PENDING",
              queryKey: keys.pendingCount("received"),
              count: () => receivedTotal("PENDING"),
              attention: true,
            },
            {
              label: "Confirmed bookings",
              href: "/tenant/requests?status=CONFIRMED",
              queryKey: ["bookings", "received", "confirmed-count"],
              count: () => receivedTotal("CONFIRMED"),
            },
            {
              label: "Your listings",
              href: "/tenant/properties",
              queryKey: [...keys.myPropertiesAll, "count"],
              count: async () => (await listMyProperties(1)).meta?.total ?? 0,
            },
          ]}
        />

        <section aria-labelledby="waiting-title" className="grid content-start gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="waiting-title" className="board-type text-step-3">
              Waiting on you
            </h2>
            <Link href="/tenant/requests" className="link inline-flex min-h-11 items-center gap-1 font-bold">
              All requests
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          {pending.isPending ? (
            <ListLoading rows={2} />
          ) : pending.isError ? (
            <QueryError
              error={pending.error}
              retry={() => void pending.refetch()}
              retrying={pending.isFetching}
            />
          ) : waiting.length === 0 ? (
            <StateBlock icon={ArrowRight} title="You're all caught up" headingLevel="h3">
              <p>
                New viewing requests show up here. Check back, or keep your listings fresh in the meantime.
              </p>
            </StateBlock>
          ) : (
            <ul className="grid gap-4">
              {waiting.map((booking) => (
                <li key={booking.id}>
                  <RequestCard
                    booking={booking}
                    perspective="tenant"
                    href={`/tenant/requests/${booking.id}`}
                    actions={
                      <>
                        <ConfirmRequest booking={booking} />
                        <DeclineRequest booking={booking} />
                      </>
                    }
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
