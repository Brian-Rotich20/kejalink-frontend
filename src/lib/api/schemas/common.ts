import { z } from "zod";

// The CSP forbids eval; tell Zod not to probe for it (its JIT check calls Function("")).
z.config({ jitless: true });

/** ISO-8601 timestamp as the API sends it (UTC, `Z`). Kept as a string; formatted at the edge. */
export const timestamp = z.iso.datetime({ offset: true });
/** YYYY-MM-DD, a Kenyan calendar date. */
export const dateOnly = z.iso.date();

export const paginationMeta = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});
export type PaginationMeta = z.infer<typeof paginationMeta>;

export const userRole = z.enum(["TENANT", "SEEKER", "ADMIN"]);
export type UserRole = z.infer<typeof userRole>;
export const userStatus = z.enum(["ACTIVE", "SUSPENDED", "BANNED"]);
export type UserStatus = z.infer<typeof userStatus>;
