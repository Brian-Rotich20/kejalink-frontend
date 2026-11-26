"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { parseAsBoolean, parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { ListLoading, QueryError } from "@/components/domain/query-states";
import { PropertyStatusPlate, UserStatusPlate } from "@/components/domain/status";
import { PageTitle } from "@/components/layout/area-shell";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Textarea } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { StateBlock } from "@/components/ui/state";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { messageFor } from "@/lib/api/errors";
import {
  adminDeleteProperty,
  adminListProperties,
  adminRejectProperty,
  adminRestoreProperty,
  keys,
} from "@/lib/api/resources";
import type { AdminPropertyItem } from "@/lib/api/schemas/property";
import { cn } from "@/lib/cn";
import { formatAmount, formatDate } from "@/lib/format";
import { PROPERTY_TYPE_LABEL } from "@/lib/kenya";
import { FilterSelect, ResultCount } from "../filters";

const parsers = {
  status: parseAsStringLiteral(["PUBLISHED", "REJECTED"] as const),
  deleted: parseAsBoolean.withDefault(false),
  page: parseAsInteger.withDefault(1),
};

type Action = { kind: "reject" | "restore" | "delete"; property: AdminPropertyItem };

export function PropertiesTable() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useQueryStates(parsers, { history: "push" });
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: keys.admin.properties(filters),
    queryFn: () =>
      adminListProperties({ status: filters.status, includeDeleted: filters.deleted, page: filters.page }),
    placeholderData: keepPreviousData,
  });

  const mutation = useMutation({
    mutationFn: async (a: Action) => {
      if (a.kind === "reject") {
        const { data } = await adminRejectProperty(a.property.id, reason.trim());
        return `Taken down. ${data.bookingsRejected} pending request(s) declined.`;
      }
      if (a.kind === "restore") {
        await adminRestoreProperty(a.property.id);
        return "Listing restored to search.";
      }
      const { data } = await adminDeleteProperty(a.property.id);
      return `Deleted. ${data.bookingsRejected} pending declined, ${data.bookingsCancelled} confirmed cancelled.`;
    },
    onSuccess: async (message) => {
      setAction(null);
      setReason("");
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success(message);
    },
  });

  const open = (a: Action) => {
    mutation.reset();
    setReason("");
    setReasonError(null);
    setAction(a);
  };

  const confirm = () => {
    if (!action) return;
    if (action.kind === "reject" && reason.trim().length < 3) {
      setReasonError("Give a reason of at least 3 characters. The lister sees it.");
      return;
    }
    setReasonError(null);
    mutation.mutate(action);
  };

  const rows = query.data?.data ?? [];

  return (
    <>
      <PageTitle title="Listings">
        <p>Take down listings that break the rules; the lister sees your reason and can fix it.</p>
      </PageTitle>

      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect
          label="Status"
          value={filters.status}
          options={[
            { value: "PUBLISHED", label: "Live" },
            { value: "REJECTED", label: "Taken down" },
          ]}
          onChange={(status) => void setFilters({ status, page: null })}
        />
        <label className="flex min-h-11 items-center gap-2 font-bold md:min-h-10">
          <input
            type="checkbox"
            className="size-5 accent-(--ink)"
            checked={filters.deleted}
            onChange={(e) => void setFilters({ deleted: e.target.checked || null, page: null })}
          />
          Include deleted
        </label>
        <div className="ml-auto self-center">
          <ResultCount total={query.data?.meta?.total} noun="listing" loading={query.isPending} />
        </div>
      </div>

      {query.isPending ? (
        <ListLoading rows={1} height="h-96" />
      ) : query.isError ? (
        <QueryError error={query.error} retry={() => void query.refetch()} retrying={query.isFetching} />
      ) : rows.length === 0 ? (
        <StateBlock icon={Building2} title="No listings match">
          <p>Change the status filter, or include deleted listings.</p>
        </StateBlock>
      ) : (
        <>
          <Table
            label="Listings"
            aria-busy={query.isFetching}
            className={cn(query.isPlaceholderData && "opacity-60")}
          >
            <THead>
              <tr>
                <TH>Listing</TH>
                <TH>Lister</TH>
                <TH>Where</TH>
                <TH className="text-right">Rent (KES)</TH>
                <TH>Status</TH>
                <TH>Updated</TH>
                <TH className="text-right">Actions</TH>
              </tr>
            </THead>
            <tbody>
              {rows.map((p) => (
                <TR key={p.id} className={cn(p.deletedAt && "text-ink-3")}>
                  <TD className="min-w-56">
                    <Link href={`/properties/${p.id}`} className="link font-bold">
                      {p.title}
                    </Link>
                    <p className="text-ink-3">
                      {PROPERTY_TYPE_LABEL[p.propertyType]} · {p.isAvailable ? "Available" : "Taken"}
                    </p>
                    {p.rejectionReason ? <p className="text-danger">Reason: {p.rejectionReason}</p> : null}
                  </TD>
                  <TD className="min-w-48">
                    <p className="font-bold">{p.tenant.name}</p>
                    <p className="break-all text-ink-2">{p.tenant.email}</p>
                    {p.tenant.status !== "ACTIVE" ? (
                      <UserStatusPlate status={p.tenant.status} className="mt-1" />
                    ) : null}
                  </TD>
                  <TD className="whitespace-nowrap">
                    {p.area}
                    <p className="text-ink-3">{p.county}</p>
                  </TD>
                  <TD className="text-right font-bold">{formatAmount(p.priceAmount)}</TD>
                  <TD>
                    {p.deletedAt ? (
                      <span className="font-bold">Deleted {formatDate(p.deletedAt)}</span>
                    ) : (
                      <PropertyStatusPlate status={p.status} />
                    )}
                  </TD>
                  <TD className="whitespace-nowrap">{formatDate(p.updatedAt)}</TD>
                  <TD>
                    {p.deletedAt ? null : (
                      <div className="flex justify-end gap-2">
                        {p.status === "PUBLISHED" ? (
                          <Button
                            size="sm"
                            onClick={() => open({ kind: "reject", property: p })}
                            aria-label={`Take down ${p.title}`}
                          >
                            Take down
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => open({ kind: "restore", property: p })}
                            aria-label={`Restore ${p.title}`}
                          >
                            Restore
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="danger-quiet"
                          onClick={() => open({ kind: "delete", property: p })}
                          aria-label={`Delete ${p.title}`}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </TD>
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

      <ConfirmDialog
        open={action !== null}
        onOpenChange={(o) => (o ? undefined : setAction(null))}
        title={
          action?.kind === "reject"
            ? "Take this listing down?"
            : action?.kind === "restore"
              ? "Restore this listing?"
              : "Delete this listing?"
        }
        confirmLabel={
          action?.kind === "reject" ? "Take down" : action?.kind === "restore" ? "Restore" : "Delete listing"
        }
        cancelLabel="Cancel"
        tone={action?.kind === "restore" ? "board" : "danger"}
        pending={mutation.isPending}
        error={mutation.error ? messageFor(mutation.error) : null}
        onConfirm={confirm}
      >
        {action ? <p className="font-bold text-ink">&ldquo;{action.property.title}&rdquo;</p> : null}
        {action?.kind === "reject" ? (
          <>
            <p>
              It disappears from search, every pending request is declined, and the lister sees your reason.
            </p>
            <Field
              label="Reason"
              hint="Required. Be specific so the lister can fix it."
              error={reasonError ?? undefined}
            >
              {({ id, describedBy, invalid }) => (
                <Textarea
                  id={id}
                  value={reason}
                  maxLength={500}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  onChange={(e) => setReason(e.target.value)}
                />
              )}
            </Field>
          </>
        ) : action?.kind === "restore" ? (
          <p>It goes back into search and the reason is cleared.</p>
        ) : action ? (
          <p>
            It is removed for good. Pending requests are declined and confirmed bookings are cancelled, with a
            note that an administrator removed the listing.
          </p>
        ) : null}
      </ConfirmDialog>
    </>
  );
}
