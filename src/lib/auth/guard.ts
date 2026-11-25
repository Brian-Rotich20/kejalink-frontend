import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/api/server";
import type { UserRole } from "@/lib/api/schemas/common";
import type { SessionUser } from "@/lib/api/schemas/user";
import { loginHref, ROLE_HOME, safeNext } from "./roles";

export const PATH_HEADER = "x-kejalink-path";

/**
 * Authoritative area check (server-side, via get-session). No session: login with ?next.
 * Suspended or banned: the suspended screen. Wrong role: the role's own area.
 */
export async function requireRole(role: UserRole): Promise<SessionUser> {
  const session = await getServerSession();
  if (!session) {
    const path = (await headers()).get(PATH_HEADER);
    redirect(loginHref(safeNext(path, ROLE_HOME[role])));
  }
  if (session.user.status !== "ACTIVE") redirect("/suspended");
  if (session.user.role !== role) redirect(ROLE_HOME[session.user.role]);
  return session.user;
}
