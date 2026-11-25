/**
 * One typed error for every failure the UI can meet: the app envelope, Better Auth's native
 * errors, network failures and timeouts. Messages here are what people read, so they say what
 * happened and what to do next.
 */

export type FieldIssue = { field: string; message: string };

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: FieldIssue[] | null;
  /** Seconds until a rate-limited request may be retried, when the server says. */
  readonly retryAfter: number | null;

  constructor(init: {
    status: number;
    code: string;
    message: string;
    details?: FieldIssue[] | null;
    retryAfter?: number | null;
  }) {
    super(init.message);
    this.name = "ApiError";
    this.status = init.status;
    this.code = init.code;
    this.details = init.details ?? null;
    this.retryAfter = init.retryAfter ?? null;
  }

  /** The message for a given field, from a 422's details. */
  fieldError(field: string): string | undefined {
    return this.details?.find((issue) => issue.field === field)?.message;
  }
}

export const isApiError = (value: unknown): value is ApiError => value instanceof ApiError;

/** Status 0 = the request never got an HTTP answer. */
export const NETWORK_ERROR = "NETWORK_ERROR";
export const TIMEOUT = "TIMEOUT";
export const INVALID_RESPONSE = "INVALID_RESPONSE";

/** Network errors and gateway failures are what a sleeping Render instance produces. */
export const isRetryable = (error: unknown): boolean =>
  isApiError(error) &&
  (error.status === 0 || error.status === 502 || error.status === 503 || error.status === 504);

export const FRIENDLY: Record<string, string> = {
  VALIDATION_ERROR: "Some details need fixing. Check the highlighted fields.",
  UNAUTHORIZED: "Please sign in to continue.",
  FORBIDDEN: "Your account can't do that.",
  ACCOUNT_SUSPENDED: "This account is suspended. Contact support if you think that's a mistake.",
  INVALID_ORIGIN: "This request came from somewhere we don't recognise. Reload the page and try again.",
  NOT_FOUND: "We couldn't find that.",
  PROPERTY_NOT_FOUND: "This place isn't listed any more.",
  BOOKING_NOT_FOUND: "We couldn't find that request.",
  UPLOAD_NOT_FOUND: "That photo is already gone.",
  USER_NOT_FOUND: "We couldn't find that account.",
  NOT_PROPERTY_OWNER: "Only the person who listed this place can change it.",
  OWN_PROPERTY: "This is your own listing, so you can't request it.",
  CANNOT_MODIFY_ADMIN: "Admin accounts can't be changed from here.",
  DUPLICATE_BOOKING: "You already have a pending request for this place.",
  PROPERTY_NOT_AVAILABLE: "Someone else got this place first. It's no longer available.",
  BOOKING_NOT_PENDING: "This request was already answered.",
  BOOKING_NOT_CANCELLABLE: "This request can't be cancelled any more.",
  PROPERTY_HAS_CONFIRMED_BOOKING: "This place has a confirmed booking. Cancel or finish that first.",
  PROPERTY_NOT_REJECTED: "This listing is already live.",
  UPLOAD_LIMIT_REACHED: "A listing can have up to 10 photos. Remove one to add another.",
  PAYLOAD_TOO_LARGE: "That photo is too big. Use one under 5 MB.",
  UNSUPPORTED_MEDIA_TYPE: "Use a JPEG, PNG or WebP photo.",
  TOO_MANY_REQUESTS: "Too many tries in a short time. Wait a moment, then try again.",
  UPLOAD_FAILED: "The photo didn't upload. Check your connection and try again.",
  INTERNAL_SERVER_ERROR: "Something broke on our side. Try again in a moment.",
  SERVICE_UNAVAILABLE: "KejaLink is busy right now. Try again in a moment.",
  DATABASE_UNAVAILABLE: "KejaLink is busy right now. Try again in a moment.",
  CONFLICT: "That changed while you were looking. Reload and try again.",
  [NETWORK_ERROR]: "We couldn't reach KejaLink. Check your connection and try again.",
  [TIMEOUT]: "The server took too long to answer. It may be waking up, so try again.",
  [INVALID_RESPONSE]: "We got an answer we didn't understand. Try again in a moment.",
};

export const GENERIC_MESSAGE = "Something went wrong. Try again in a moment.";

/** The friendly sentence for an error, whatever its source. */
export function messageFor(error: unknown): string {
  if (isApiError(error))
    return FRIENDLY[error.code] ?? (error.status >= 500 ? GENERIC_MESSAGE : error.message);
  return GENERIC_MESSAGE;
}

const parseRetryAfter = (headers: Headers): number | null => {
  const raw = headers.get("retry-after") ?? headers.get("x-retry-after");
  if (!raw) return null;
  const seconds = Number(raw);
  return Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds) : null;
};

const asIssues = (details: unknown): FieldIssue[] | null => {
  if (!Array.isArray(details)) return null;
  const issues = details.filter(
    (d): d is FieldIssue =>
      typeof d === "object" &&
      d !== null &&
      typeof (d as Record<string, unknown>).field === "string" &&
      typeof (d as Record<string, unknown>).message === "string",
  );
  return issues.length > 0 ? issues : null;
};

/** Build an ApiError from an app-envelope error response (`{success:false,error:{...}}`). */
export function fromEnvelope(status: number, body: unknown, headers: Headers): ApiError {
  const error = typeof body === "object" && body !== null ? (body as { error?: unknown }).error : undefined;
  if (typeof error === "object" && error !== null) {
    const e = error as { code?: unknown; message?: unknown; details?: unknown };
    return new ApiError({
      status,
      code: typeof e.code === "string" ? e.code : codeForStatus(status),
      message: typeof e.message === "string" ? e.message : GENERIC_MESSAGE,
      details: asIssues(e.details),
      retryAfter: parseRetryAfter(headers),
    });
  }
  return new ApiError({
    status,
    code: codeForStatus(status),
    message: GENERIC_MESSAGE,
    retryAfter: parseRetryAfter(headers),
  });
}

export function codeForStatus(status: number): string {
  switch (status) {
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 413:
      return "PAYLOAD_TOO_LARGE";
    case 415:
      return "UNSUPPORTED_MEDIA_TYPE";
    case 422:
      return "VALIDATION_ERROR";
    case 429:
      return "TOO_MANY_REQUESTS";
    case 502:
    case 503:
    case 504:
      return "SERVICE_UNAVAILABLE";
    default:
      return status >= 500 ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST";
  }
}

/* ------------------------------------------------------------------ */
/* Better Auth (native {message, code} errors on /api/auth/*)          */
/* ------------------------------------------------------------------ */

const AUTH_FRIENDLY: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "That email and password don't match. Check them and try again.",
  INVALID_PASSWORD: "That email and password don't match. Check them and try again.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "That email and password don't match. Check them and try again.",
  USER_ALREADY_EXISTS: "An account with this email already exists. Sign in instead.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "An account with this email already exists. Sign in instead.",
  INVALID_EMAIL: "That email address doesn't look right.",
  PASSWORD_TOO_SHORT: "Use a password of at least 8 characters.",
  PASSWORD_TOO_LONG: "That password is too long. Use 128 characters or fewer.",
  INVALID_ORIGIN: FRIENDLY.INVALID_ORIGIN ?? GENERIC_MESSAGE,
  MISSING_OR_NULL_ORIGIN: FRIENDLY.INVALID_ORIGIN ?? GENERIC_MESSAGE,
  FAILED_TO_CREATE_USER: "We couldn't create your account. Try again in a moment.",
};

/**
 * Normalise a Better Auth client error ({status, code?, message?}) into an ApiError.
 * Login is blocked for suspended accounts with a bare 403, which we map to ACCOUNT_SUSPENDED.
 */
export function fromAuthError(
  error: { status?: number; code?: string; message?: string } | null | undefined,
): ApiError {
  const status = error?.status ?? 0;
  const code = error?.code;
  if (status === 0)
    return new ApiError({
      status: 0,
      code: NETWORK_ERROR,
      message: FRIENDLY[NETWORK_ERROR] ?? GENERIC_MESSAGE,
    });
  if (status === 429)
    return new ApiError({
      status,
      code: "TOO_MANY_REQUESTS",
      message: FRIENDLY.TOO_MANY_REQUESTS ?? GENERIC_MESSAGE,
    });
  if (code && AUTH_FRIENDLY[code]) return new ApiError({ status, code, message: AUTH_FRIENDLY[code] });
  if (status === 403 && /suspend|banned/i.test(error?.message ?? "")) {
    return new ApiError({
      status,
      code: "ACCOUNT_SUSPENDED",
      message: FRIENDLY.ACCOUNT_SUSPENDED ?? GENERIC_MESSAGE,
    });
  }
  if (status === 401) {
    return new ApiError({
      status,
      code: "INVALID_EMAIL_OR_PASSWORD",
      message: AUTH_FRIENDLY.INVALID_EMAIL_OR_PASSWORD ?? GENERIC_MESSAGE,
    });
  }
  if (status >= 500) return new ApiError({ status, code: "INTERNAL_SERVER_ERROR", message: GENERIC_MESSAGE });
  // Known-safe text from Better Auth's own validation (e.g. the role/name hooks), else generic.
  const message = error?.message && error.message.length <= 160 ? error.message : GENERIC_MESSAGE;
  return new ApiError({ status, code: code ?? codeForStatus(status), message });
}
