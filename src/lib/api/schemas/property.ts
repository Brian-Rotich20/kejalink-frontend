import { z } from "zod";
import { PROPERTY_TYPES } from "@/lib/kenya";
import { timestamp, userStatus } from "./common";

export const propertyType = z.enum(PROPERTY_TYPES);
export const propertyStatus = z.enum(["PUBLISHED", "REJECTED"]);
export type PropertyStatus = z.infer<typeof propertyStatus>;

/** GET /api/properties item. */
export const propertyListItem = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  title: z.string(),
  propertyType,
  priceAmount: z.number(),
  priceCurrency: z.string(),
  bedrooms: z.number().int().nullable(),
  bathrooms: z.number().int().nullable(),
  county: z.string(),
  area: z.string(),
  isAvailable: z.boolean(),
  primaryImageUrl: z.url().nullable(),
  createdAt: timestamp,
});
export type PropertyListItem = z.infer<typeof propertyListItem>;

/** GET /api/properties/me item. */
export const ownerPropertyListItem = propertyListItem.extend({
  status: propertyStatus,
  rejectionReason: z.string().nullable(),
  updatedAt: timestamp,
});
export type OwnerPropertyListItem = z.infer<typeof ownerPropertyListItem>;

export const propertyImage = z.object({
  id: z.uuid(),
  url: z.url(),
  isPrimary: z.boolean(),
  displayOrder: z.number().int(),
  createdAt: timestamp,
});
export type PropertyImage = z.infer<typeof propertyImage>;

/** GET /api/properties/:id. */
export const propertyDetail = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  title: z.string(),
  description: z.string(),
  propertyType,
  priceAmount: z.number(),
  priceCurrency: z.string(),
  bedrooms: z.number().int().nullable(),
  bathrooms: z.number().int().nullable(),
  county: z.string(),
  area: z.string(),
  addressText: z.string().nullable(),
  amenities: z.array(z.string()),
  status: propertyStatus,
  isAvailable: z.boolean(),
  rejectionReason: z.string().nullable().optional(),
  deletedAt: timestamp.nullable().optional(),
  createdAt: timestamp,
  updatedAt: timestamp,
  tenant: z.object({ id: z.string(), name: z.string(), image: z.string().nullable() }),
  uploads: z.array(propertyImage),
});
export type PropertyDetail = z.infer<typeof propertyDetail>;

/** GET /api/admin/properties item. */
export const adminPropertyItem = propertyListItem.extend({
  status: propertyStatus,
  rejectionReason: z.string().nullable(),
  deletedAt: timestamp.nullable(),
  updatedAt: timestamp,
  tenant: z.object({ id: z.string(), name: z.string(), email: z.string(), status: userStatus }),
});
export type AdminPropertyItem = z.infer<typeof adminPropertyItem>;

export const deletedProperty = z.object({ id: z.uuid(), deletedAt: timestamp });

export const adminRejectPropertyResult = z.object({
  property: z.object({ id: z.uuid() }).loose(),
  bookingsRejected: z.number().int(),
});
export const adminDeletePropertyResult = z.object({
  id: z.uuid(),
  deletedAt: timestamp,
  bookingsRejected: z.number().int(),
  bookingsCancelled: z.number().int(),
});
