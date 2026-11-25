import { z } from "zod";
import { ApiError, fromEnvelope, INVALID_RESPONSE } from "./errors";
import { paginationMeta, type PaginationMeta } from "./schemas/common";

export type Envelope<T> = { data: T; meta: PaginationMeta | null };

const successShape = z.object({
  success: z.literal(true),
  data: z.unknown(),
  meta: paginationMeta.optional(),
});

/**
 * Unwrap the app envelope and validate `data` with the resource schema.
 * Throws ApiError for error envelopes, HTTP failures and responses that fail validation.
 */
export function parseEnvelope<S extends z.ZodType>(
  status: number,
  body: unknown,
  headers: Headers,
  schema: S,
): Envelope<z.infer<S>> {
  if (status < 200 || status >= 300) throw fromEnvelope(status, body, headers);
  const outer = successShape.safeParse(body);
  if (!outer.success) {
    throw new ApiError({ status, code: INVALID_RESPONSE, message: "Unexpected response shape" });
  }
  const data = schema.safeParse(outer.data.data);
  if (!data.success) {
    throw new ApiError({ status, code: INVALID_RESPONSE, message: "Response failed validation" });
  }
  return { data: data.data, meta: outer.data.meta ?? null };
}

/** Read a body as JSON without throwing on empty or non-JSON bodies. */
export async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
