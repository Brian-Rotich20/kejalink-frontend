import { z } from "zod";

/** Blank strings (as copied from .env.example) count as unset, like the backend. */
export function withoutBlanks<T extends Record<string, string | undefined>>(raw: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(raw) as [keyof T, string | undefined][]) {
    if (value !== undefined && value.trim() !== "") out[key] = value.trim() as T[keyof T];
  }
  return out;
}

/** Throws one readable error naming every bad variable. Values are never echoed. */
export function parseOrThrow<S extends z.ZodType>(schema: S, raw: unknown, label: string): z.infer<S> {
  const result = schema.safeParse(raw);
  if (result.success) return result.data;
  const lines = result.error.issues.map(
    (issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
  );
  throw new Error(`Invalid ${label} environment:\n${lines.join("\n")}`);
}

export const httpUrl = z.url({ protocol: /^https?$/ }).transform((value) => value.replace(/\/+$/, ""));
