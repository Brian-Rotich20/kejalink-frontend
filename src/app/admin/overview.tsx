"use client";

import { StatusBoard } from "@/components/domain/status-board";
import { PageTitle } from "@/components/layout/area-shell";
import { adminListBookings, adminListProperties, adminListUsers, keys } from "@/lib/api/resources";

const total = async (p: Promise<{ meta: { total: number } | null }>) => (await p).meta?.total ?? 0;

export function AdminOverview() {
  return (
    <>
      <PageTitle title="Moderation">
        <p>What needs a look today. Each row opens the list behind it.</p>
      </PageTitle>
      <div className="grid gap-6 md:grid-cols-2">
        <StatusBoard
          title="Accounts"
          rows={[
            {
              label: "All users",
              href: "/admin/users",
              queryKey: keys.admin.count("users"),
              count: () => total(adminListUsers({})),
            },
            {
              label: "Suspended",
              href: "/admin/users?status=SUSPENDED",
              queryKey: keys.admin.count("users-suspended"),
              count: () => total(adminListUsers({ status: "SUSPENDED" })),
              attention: true,
            },
            {
              label: "Banned",
              href: "/admin/users?status=BANNED",
              queryKey: keys.admin.count("users-banned"),
              count: () => total(adminListUsers({ status: "BANNED" })),
            },
          ]}
        />
        <StatusBoard
          title="Listings and requests"
          rows={[
            {
              label: "Live listings",
              href: "/admin/properties?status=PUBLISHED",
              queryKey: keys.admin.count("properties-live"),
              count: () => total(adminListProperties({ status: "PUBLISHED" })),
            },
            {
              label: "Taken down",
              href: "/admin/properties?status=REJECTED",
              queryKey: keys.admin.count("properties-rejected"),
              count: () => total(adminListProperties({ status: "REJECTED" })),
              attention: true,
            },
            {
              label: "Pending requests",
              href: "/admin/bookings?status=PENDING",
              queryKey: keys.admin.count("bookings-pending"),
              count: () => total(adminListBookings({ status: "PENDING" })),
            },
          ]}
        />
      </div>
    </>
  );
}
