import type { UserRole } from "@/lib/api/schemas/common";

/** Each role's home. Wrong-role visitors are sent here. */
export const ROLE_HOME: Record<UserRole, "/seeker" | "/tenant" | "/admin"> = {
  SEEKER: "/seeker",
  TENANT: "/tenant",
  ADMIN: "/admin",
};

export const PROTECTED_PREFIXES = ["/seeker", "/tenant", "/admin"] as const;

/**
 * Only same-site relative paths are allowed as a post-login destination
 * (blocks open redirects like `//evil.example` or `https://evil.example`).
 */
export function safeNext(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  try {
    const url = new URL(next, "https://kejalink.invalid");
    if (url.origin !== "https://kejalink.invalid") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

/** Where to land after sign-in: the requested page if the role may see it, else the role's home. */
export function landingFor(role: UserRole, next: string | null | undefined): string {
  const target = safeNext(next, ROLE_HOME[role]);
  const area = PROTECTED_PREFIXES.find((prefix) => target === prefix || target.startsWith(`${prefix}/`));
  if (area && area !== ROLE_HOME[role]) return ROLE_HOME[role];
  return target;
}

export const loginHref = (next?: string) => (next ? `/login?next=${encodeURIComponent(next)}` : "/login");
