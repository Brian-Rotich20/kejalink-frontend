"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Camera, EyeOff, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";
import { PropertyPlate } from "@/components/domain/property-plate";
import { ListLoading, QueryError } from "@/components/domain/query-states";
import { PropertyStatusPlate } from "@/components/domain/status";
import { PageTitle } from "@/components/layout/area-shell";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { StateBlock } from "@/components/ui/state";
import { keys, listMyProperties } from "@/lib/api/resources";
import { plural } from "@/lib/format";
import { AvailabilitySwitch, DeleteListing } from "./listing-controls";

export function MyListings() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const query = useQuery({
    queryKey: keys.myProperties(page),
    queryFn: () => listMyProperties(page),
    placeholderData: keepPreviousData,
  });
  const listings = query.data?.data ?? [];
  const total = query.data?.meta?.total ?? 0;

  return (
    <>
      <PageTitle
        title="My listings"
        action={
          <Button asChild variant="band">
            <Link href="/tenant/properties/new">
              <Plus aria-hidden />
              List a place
            </Link>
          </Button>
        }
      >
        <p>
          {query.data ? `${plural(total, "listing")}. ` : ""}Keep availability true so nobody chases a place
          that&apos;s gone.
        </p>
      </PageTitle>

      {query.isPending ? (
        <ListLoading rows={2} height="h-72" />
      ) : query.isError ? (
        <QueryError error={query.error} retry={() => void query.refetch()} retrying={query.isFetching} />
      ) : listings.length === 0 ? (
        <StateBlock
          icon={Camera}
          title="List your first place"
          action={
            <Button asChild variant="board" size="lg">
              <Link href="/tenant/properties/new">List a place</Link>
            </Button>
          }
        >
          <p>It takes a few minutes: rent, area, a short description and a few photos from your phone.</p>
        </StateBlock>
      ) : (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing, index) => (
              <li key={listing.id} className="grid gap-0">
                {listing.status === "REJECTED" ? (
                  <div
                    role="note"
                    className="grid gap-1 rounded-t-md border border-b-0 border-danger/40 bg-danger-soft p-3 text-step--1"
                  >
                    <p className="flex items-center gap-1.5 font-bold text-danger">
                      <EyeOff aria-hidden className="size-4" />
                      Hidden from search by a moderator
                    </p>
                    {listing.rejectionReason ? (
                      <p className="text-ink-2">Reason: {listing.rejectionReason}</p>
                    ) : null}
                    <p className="text-ink-2">
                      Edit the listing to fix it, then contact support to have it restored.
                    </p>
                  </div>
                ) : null}
                <PropertyPlate
                  property={listing}
                  index={index}
                  href={`/tenant/properties/${listing.id}`}
                  footer={
                    <div className="grid gap-3 border-t border-line pt-3">
                      <div className="flex items-center justify-between gap-3">
                        <AvailabilitySwitch id={listing.id} isAvailable={listing.isAvailable} />
                        <PropertyStatusPlate status={listing.status} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm">
                          <Link href={`/tenant/properties/${listing.id}`}>
                            <Pencil aria-hidden />
                            Edit & photos
                          </Link>
                        </Button>
                        <DeleteListing id={listing.id} title={listing.title} />
                      </div>
                    </div>
                  }
                />
              </li>
            ))}
          </ul>
          <Pagination
            page={page}
            totalPages={query.data?.meta?.totalPages ?? 1}
            onPage={(next) => void setPage(next)}
            disabled={query.isFetching}
          />
        </>
      )}
    </>
  );
}
