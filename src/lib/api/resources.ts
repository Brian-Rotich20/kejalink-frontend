import { z } from "zod";
import { apiFetch } from "./client";
import {
  adminDeletePropertyResult,
  adminPropertyItem,
  adminRejectPropertyResult,
  adminUpdateUserResult,
  booking,
  type BookingStatus,
  deletedProperty,
  ownerPropertyListItem,
  propertyDetail,
  propertyImage,
  type UserRole,
  type UserStatus,
  userProfile,
} from "./schemas";

/** Query keys, one place, so mutations invalidate exactly what they change. */
export const keys = {
  me: ["users", "me"] as const,
  property: (id: string) => ["properties", "detail", id] as const,
  myProperties: (page: number) => ["properties", "mine", page] as const,
  myPropertiesAll: ["properties", "mine"] as const,
  myBookings: (status: BookingStatus | null, page: number) => ["bookings", "mine", status, page] as const,
  receivedBookings: (status: BookingStatus | null, page: number) =>
    ["bookings", "received", status, page] as const,
  booking: (id: string) => ["bookings", "detail", id] as const,
  pendingCount: (side: "mine" | "received") => ["bookings", side, "pending-count"] as const,
  admin: {
    users: (filters: Record<string, unknown>) => ["admin", "users", filters] as const,
    properties: (filters: Record<string, unknown>) => ["admin", "properties", filters] as const,
    bookings: (filters: Record<string, unknown>) => ["admin", "bookings", filters] as const,
    count: (what: string) => ["admin", "count", what] as const,
  },
};

const PAGE = 10;

/* ----------------------------- users ----------------------------- */

export const getMe = () => apiFetch("/users/me", { schema: userProfile });
export const updateMe = (body: { name: string }) =>
  apiFetch("/users/me", { method: "PATCH", body, schema: userProfile });

/* --------------------------- properties -------------------------- */

export type PropertyInput = {
  title: string;
  description: string;
  propertyType: "HOUSE" | "APARTMENT" | "ROOM" | "BEDSITTER" | "STUDIO" | "OTHER";
  priceAmount: number;
  bedrooms?: number | undefined;
  bathrooms?: number | undefined;
  county: string;
  area: string;
  addressText?: string | undefined;
  amenities?: string[] | undefined;
};

export type PropertyPatch = Partial<Omit<PropertyInput, "bedrooms" | "bathrooms" | "addressText">> & {
  bedrooms?: number | null;
  bathrooms?: number | null;
  addressText?: string | null;
  isAvailable?: boolean;
};

export const getProperty = (id: string) => apiFetch(`/properties/${id}`, { schema: propertyDetail });
export const listMyProperties = (page = 1) =>
  apiFetch("/properties/me", { schema: z.array(ownerPropertyListItem), query: { page, limit: 20 } });
export const createProperty = (body: PropertyInput) =>
  apiFetch("/properties", { method: "POST", body, schema: propertyDetail });
export const updateProperty = (id: string, body: PropertyPatch) =>
  apiFetch(`/properties/${id}`, { method: "PATCH", body, schema: propertyDetail });
export const deleteProperty = (id: string) =>
  apiFetch(`/properties/${id}`, { method: "DELETE", schema: deletedProperty });

export const updateUpload = (
  propertyId: string,
  uploadId: string,
  body: { isPrimary?: true; displayOrder?: number },
) =>
  apiFetch(`/properties/${propertyId}/uploads/${uploadId}`, { method: "PATCH", body, schema: propertyImage });
export const deleteUpload = (propertyId: string, uploadId: string) =>
  apiFetch(`/properties/${propertyId}/uploads/${uploadId}`, { method: "DELETE", schema: z.unknown() });

/* ---------------------------- bookings --------------------------- */

export const createBooking = (body: { propertyId: string; preferredMoveInDate?: string; message?: string }) =>
  apiFetch("/bookings", { method: "POST", body, schema: booking });
export const listMyBookings = (status: BookingStatus | null, page = 1, limit = PAGE) =>
  apiFetch("/bookings/me", { schema: z.array(booking), query: { status, page, limit } });
export const listReceivedBookings = (status: BookingStatus | null, page = 1, limit = PAGE) =>
  apiFetch("/bookings/received", { schema: z.array(booking), query: { status, page, limit } });
export const getBooking = (id: string) => apiFetch(`/bookings/${id}`, { schema: booking });
export const cancelBooking = (id: string) =>
  apiFetch(`/bookings/${id}/cancel`, { method: "PATCH", schema: booking });
export const confirmBooking = (id: string) =>
  apiFetch(`/bookings/${id}/confirm`, { method: "PATCH", schema: booking });
/** No reason → no body at all (the API accepts an absent body). */
export const rejectBooking = (id: string, reason?: string) =>
  apiFetch(`/bookings/${id}/reject`, {
    method: "PATCH",
    body: reason ? { reason } : undefined,
    schema: booking,
  });

/** Pending count for dashboards: `meta.total` of a one-item page (V1 has no notifications). */
export const countPending = async (side: "mine" | "received") => {
  const list = side === "mine" ? listMyBookings : listReceivedBookings;
  const { meta } = await list("PENDING", 1, 1);
  return meta?.total ?? 0;
};

/* ------------------------------ admin ---------------------------- */

export type AdminUserFilters = {
  q?: string;
  role?: UserRole | null;
  status?: UserStatus | null;
  page?: number;
};
export const adminListUsers = (f: AdminUserFilters) =>
  apiFetch("/admin/users", {
    schema: z.array(userProfile),
    query: { q: f.q, role: f.role, status: f.status, page: f.page ?? 1, limit: 25 },
  });
export const adminSetUserStatus = (id: string, status: UserStatus) =>
  apiFetch(`/admin/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { status },
    schema: adminUpdateUserResult,
  });

export type AdminPropertyFilters = {
  status?: "PUBLISHED" | "REJECTED" | null;
  tenantId?: string;
  includeDeleted?: boolean;
  page?: number;
};
export const adminListProperties = (f: AdminPropertyFilters) =>
  apiFetch("/admin/properties", {
    schema: z.array(adminPropertyItem),
    query: {
      status: f.status,
      tenantId: f.tenantId,
      includeDeleted: f.includeDeleted ? true : undefined,
      page: f.page ?? 1,
      limit: 25,
    },
  });
export const adminRejectProperty = (id: string, reason: string) =>
  apiFetch(`/admin/properties/${id}/reject`, {
    method: "PATCH",
    body: { reason },
    schema: adminRejectPropertyResult,
  });
export const adminRestoreProperty = (id: string) =>
  apiFetch(`/admin/properties/${id}/restore`, { method: "PATCH", schema: z.unknown() });
export const adminDeleteProperty = (id: string) =>
  apiFetch(`/admin/properties/${id}`, { method: "DELETE", schema: adminDeletePropertyResult });

export type AdminBookingFilters = {
  status?: BookingStatus | null;
  propertyId?: string;
  seekerId?: string;
  page?: number;
};
export const adminListBookings = (f: AdminBookingFilters) =>
  apiFetch("/admin/bookings", {
    schema: z.array(booking),
    query: { status: f.status, propertyId: f.propertyId, seekerId: f.seekerId, page: f.page ?? 1, limit: 25 },
  });
