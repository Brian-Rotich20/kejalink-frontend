"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserX } from "lucide-react";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useId, useState } from "react";
import { toast } from "sonner";
import { ListLoading, QueryError } from "@/components/domain/query-states";
import { UserStatusPlate } from "@/components/domain/status";
import { PageTitle } from "@/components/layout/area-shell";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { controlClass } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { StateBlock } from "@/components/ui/state";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { useDebouncedCallback } from "@/hooks/use-debounced";
import { messageFor } from "@/lib/api/errors";
import { adminListUsers, adminSetUserStatus, keys } from "@/lib/api/resources";
import type { UserProfile } from "@/lib/api/schemas/user";
import type { UserStatus } from "@/lib/api/schemas/common";
import { useSession } from "@/lib/auth/client";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { FilterSelect, ResultCount } from "../filters";

const ROLES = ["SEEKER", "TENANT", "ADMIN"] as const;
const STATUSES = ["ACTIVE", "SUSPENDED", "BANNED"] as const;
const ROLE_LABEL = { SEEKER: "Seeker", TENANT: "Lister", ADMIN: "Admin" } as const;

const parsers = {
  q: parseAsString.withDefault(""),
  role: parseAsStringLiteral(ROLES),
  status: parseAsStringLiteral(STATUSES),
  page: parseAsInteger.withDefault(1),
};

type Change = { user: UserProfile; to: UserStatus };

const CONSEQUENCE: Record<UserStatus, (u: UserProfile) => string[]> = {
  SUSPENDED: (u) => [
    `${u.name} is signed out everywhere straight away and can't sign in.`,
    u.role === "TENANT"
      ? "Their listings disappear from search while suspended."
      : "Their requests stay on record.",
    "You can reactivate the account later.",
  ],
  BANNED: (u) => [
    `${u.name} is signed out everywhere straight away and can't sign in.`,
    u.role === "TENANT" ? "Their listings disappear from search." : "Their requests stay on record.",
    "Use this for fraud or abuse. You can still reactivate if it was a mistake.",
  ],
  ACTIVE: (u) =>
    [
      `${u.name} can sign in again.`,
      u.role === "TENANT" ? "Their published listings return to search." : "",
    ].filter(Boolean),
};

const ACTION_LABEL: Record<UserStatus, string> = {
  ACTIVE: "Reactivate",
  SUSPENDED: "Suspend",
  BANNED: "Ban",
};

export function UsersTable() {
  const searchId = useId();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useQueryStates(parsers, { history: "push" });
  const [draft, setDraft] = useState(filters.q);
  const commitSearch = useDebouncedCallback(
    (q: string) => void setFilters({ q: q.trim() || null, page: null }),
    400,
  );
  const [change, setChange] = useState<Change | null>(null);

  const query = useQuery({
    queryKey: keys.admin.users(filters),
    queryFn: () =>
      adminListUsers({
        q: filters.q || undefined,
        role: filters.role,
        status: filters.status,
        page: filters.page,
      }),
    placeholderData: keepPreviousData,
  });

  const mutation = useMutation({
    mutationFn: ({ user, to }: Change) => adminSetUserStatus(user.id, to),
    onSuccess: async ({ data }) => {
      setChange(null);
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success(`${data.user.name} is now ${data.user.status.toLowerCase()}`, {
        description: data.sessionsRevoked > 0 ? `${data.sessionsRevoked} session(s) signed out.` : undefined,
      });
    },
  });

  const users = query.data?.data ?? [];

  return (
    <>
      <PageTitle title="Users">
        <p>Suspend or ban accounts that break the rules. Admin accounts can&apos;t be changed here.</p>
      </PageTitle>

      <div className="flex flex-wrap items-end gap-3">
        <div className="grid min-w-60 flex-1 gap-1 md:max-w-sm">
          <label htmlFor={searchId} className="text-step--1 font-bold text-ink-2">
            Search name or email
          </label>
          <input
            id={searchId}
            type="search"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              commitSearch(e.target.value);
            }}
            className={cn(controlClass, "md:min-h-10")}
            placeholder="e.g. wanjiru"
          />
        </div>
        <FilterSelect
          label="Role"
          value={filters.role}
          options={ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
          onChange={(role) => void setFilters({ role, page: null })}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          options={STATUSES.map((s) => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase() }))}
          onChange={(status) => void setFilters({ status, page: null })}
        />
        <div className="ml-auto self-center">
          <ResultCount total={query.data?.meta?.total} noun="user" loading={query.isPending} />
        </div>
      </div>

      {query.isPending ? (
        <ListLoading rows={1} height="h-96" />
      ) : query.isError ? (
        <QueryError error={query.error} retry={() => void query.refetch()} retrying={query.isFetching} />
      ) : users.length === 0 ? (
        <StateBlock icon={UserX} title="No users match">
          <p>Try a shorter search, or clear the role and status filters.</p>
        </StateBlock>
      ) : (
        <>
          <Table
            label="Users"
            aria-busy={query.isFetching}
            className={cn(query.isPlaceholderData && "opacity-60")}
          >
            <THead>
              <tr>
                <TH>Name</TH>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH>Joined</TH>
                <TH className="text-right">Actions</TH>
              </tr>
            </THead>
            <tbody>
              {users.map((user) => {
                const locked = user.role === "ADMIN" || user.id === session?.user.id;
                return (
                  <TR key={user.id}>
                    <TD className="font-bold">{user.name}</TD>
                    <TD className="break-all">{user.email}</TD>
                    <TD>{ROLE_LABEL[user.role]}</TD>
                    <TD>
                      <UserStatusPlate status={user.status} />
                    </TD>
                    <TD className="whitespace-nowrap">{formatDate(user.createdAt)}</TD>
                    <TD>
                      {locked ? (
                        <span className="block text-right text-ink-3">Protected</span>
                      ) : (
                        <div className="flex justify-end gap-2">
                          {(["ACTIVE", "SUSPENDED", "BANNED"] as const)
                            .filter((to) => to !== user.status)
                            .map((to) => (
                              <Button
                                key={to}
                                size="sm"
                                variant={
                                  to === "ACTIVE" ? "quiet" : to === "BANNED" ? "danger-quiet" : "quiet"
                                }
                                onClick={() => setChange({ user, to })}
                                aria-label={`${ACTION_LABEL[to]} ${user.name}`}
                              >
                                {ACTION_LABEL[to]}
                              </Button>
                            ))}
                        </div>
                      )}
                    </TD>
                  </TR>
                );
              })}
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
        open={change !== null}
        onOpenChange={(open) => (open ? undefined : setChange(null))}
        title={change ? `${ACTION_LABEL[change.to]} ${change.user.name}?` : ""}
        confirmLabel={change ? `${ACTION_LABEL[change.to]} account` : ""}
        cancelLabel="Cancel"
        tone={change?.to === "ACTIVE" ? "board" : "danger"}
        pending={mutation.isPending}
        error={mutation.error ? messageFor(mutation.error) : null}
        onConfirm={() => (change ? mutation.mutate(change) : undefined)}
      >
        {change ? (
          <ul className="ml-5 grid list-disc gap-1.5">
            {CONSEQUENCE[change.to](change.user).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
      </ConfirmDialog>
    </>
  );
}
