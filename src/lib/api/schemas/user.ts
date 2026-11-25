import { z } from "zod";
import { timestamp, userRole, userStatus } from "./common";

export const userProfile = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  role: userRole,
  status: userStatus,
  createdAt: timestamp,
  updatedAt: timestamp,
});
export type UserProfile = z.infer<typeof userProfile>;

export const adminUpdateUserResult = z.object({ user: userProfile, sessionsRevoked: z.number().int() });

/** GET /api/auth/get-session (Better Auth native; `null` when signed out). */
export const sessionUser = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable().optional(),
  role: userRole,
  status: userStatus,
});
export type SessionUser = z.infer<typeof sessionUser>;

export const sessionResponse = z
  .object({
    session: z.object({ id: z.string(), expiresAt: z.union([timestamp, z.string()]) }).loose(),
    user: sessionUser,
  })
  .nullable();
export type SessionResponse = z.infer<typeof sessionResponse>;
