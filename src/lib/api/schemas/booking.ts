import { z } from "zod";
import { dateOnly, timestamp } from "./common";

export const bookingStatus = z.enum(["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"]);
export type BookingStatus = z.infer<typeof bookingStatus>;

export const booking = z.object({
  id: z.uuid(),
  status: bookingStatus,
  preferredMoveInDate: dateOnly.nullable(),
  message: z.string().nullable(),
  decisionReason: z.string().nullable(),
  decidedAt: timestamp.nullable(),
  createdAt: timestamp,
  updatedAt: timestamp,
  property: z.object({
    id: z.uuid(),
    title: z.string(),
    county: z.string(),
    area: z.string(),
    priceAmount: z.number(),
    priceCurrency: z.string(),
    isAvailable: z.boolean(),
    primaryImageUrl: z.url().nullable(),
  }),
  seeker: z.object({ id: z.string(), name: z.string(), email: z.string(), image: z.string().nullable() }),
  /** `email` reaches the seeker only once the booking is CONFIRMED. */
  tenant: z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().nullable(),
    email: z.string().optional(),
  }),
});
export type Booking = z.infer<typeof booking>;
