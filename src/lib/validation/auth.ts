import { z } from "zod";

/** Mirrors Better Auth's config on the API: name 1–100 (trimmed), password 8–128. */
export const signInSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").pipe(z.email("That email address doesn't look right")),
  password: z.string().min(1, "Enter your password"),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const ROLE_CHOICES = ["SEEKER", "TENANT"] as const;

export const registerSchema = z.object({
  role: z.enum(ROLE_CHOICES, { error: "Choose what you're here to do" }),
  name: z.string().trim().min(1, "Enter your name").max(100, "Use 100 characters or fewer"),
  email: z.string().trim().min(1, "Enter your email").pipe(z.email("That email address doesn't look right")),
  password: z.string().min(8, "Use at least 8 characters").max(128, "Use 128 characters or fewer"),
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100, "Use 100 characters or fewer"),
});
export type ProfileValues = z.infer<typeof profileSchema>;
