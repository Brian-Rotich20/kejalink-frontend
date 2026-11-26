"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import Link from "next/link";
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";
import { ListLoading, QueryError } from "@/components/domain/query-states";
import { BookingStatusPlate } from "@/components/domain/status";
import { PageTitle } from "@/components/layout/area-shell";
import { Pagination } from "@/components/ui/pagination";
import { StateBlock } from "@/components/ui/state";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { adminListBookings, keys } from "@/lib/api/resources";
import { cn } from "@/lib/cn";
import { formatDateOnly, formatDateTime } from "@/lib/format";
import { FilterSelect, ResultCount } from "../filters";

const STATUSES = ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"] as const;
const LABEL = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  REJECTED: "Declined",
  CANCELLED: "Cancelled",
} as const;

const parsers = {
  status: parseAsStringLiteral(STATUSES),
  page: parseAsInteger.withDefault(1),
};

/** Read-only: admins can see every request but never answer one on a lister's behalf. */
export function BookingsTable() {
  const [filters, setFilters] = useQueryStates(parsers, { history: "push" });
  const query = useQuery({
    queryKey: keys.admin.bookings(filters),
    queryFn: () => adminListBookings({ status: filters.status, page: filters.page }),
    placeholderData: keepPreviousData,
  });
  const rows = query.data?.data ?? [];

  return (
    <>
      <PageTitle title="Requests">
        <p>Every viewing request on KejaLink, read-only. Only the lister can confirm or decline.</p>
      </PageTitle>

      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect
          label="Status"
          value={filters.status}
          options={STATUSES.map((s) => ({ value: s, label: LABEL[s] }))}
          onChange={(status) => void setFilters({ status, page: null })}
        />
        <div className="ml-auto self-center">
          <ResultCount total={query.data?.meta?.total} noun="request" loading={query.isPending} />
        </div>
      </div>

      {query.isPending ? (
        <ListLoading rows={1} height="h-96" />
      ) : query.isError ? (
        <QueryError error={query.error} retry={() => void query.refetch()} retrying={query.isFetching} />
      ) : rows.length === 0 ? (
        <StateBlock icon={Inbox} title="No requests match">
          <p>Try another status.</p>
        </StateBlock>
      ) : (
        <>
          <Table
            label="Requests"
            aria-busy={query.isFetching}
            className={cn(query.isPlaceholderData && "opacity-60")}
          >
            <THead>
              <tr>
                <TH>Listing</TH>
                <TH>Seeker</TH>
                <TH>Lister</TH>
                <TH>Status</TH>
                <TH>Move-in</TH>
                <TH>Sent</TH>
              </tr>
            </THead>
            <tbody>
              {rows.map((b) => (
                <TR key={b.id}>
                  <TD className="min-w-52">
                    <Link href={`/admin/bookings/${b.id}`} className="link font-bold">
                      {b.property.title}
                    </Link>
                    <p className="text-ink-3">{b.property.area}</p>
                  </TD>
                  <TD className="min-w-44">
                    <p className="font-bold">{b.seeker.name}</p>
                    <p className="break-all text-ink-2">{b.seeker.email}</p>
                  </TD>
                  <TD className="min-w-44">
                    <p className="font-bold">{b.tenant.name}</p>
                    {b.tenant.email ? <p className="break-all text-ink-2">{b.tenant.email}</p> : null}
                  </TD>
                  <TD>
                    <BookingStatusPlate status={b.status} />
                  </TD>
                  <TD className="whitespace-nowrap">
                    {b.preferredMoveInDate ? formatDateOnly(b.preferredMoveInDate) : "–"}
                  </TD>
                  <TD className="whitespace-nowrap">{formatDateTime(b.createdAt)}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
          <Pagination
            page={filters.page}
            totalPages={query.data?.meta?.totalPages ?? 1}
            onPage={(page) => void setFilters({ page })}
            disabled={query.isFetching}
          />
        </>
      )}
    </>
  );
}
