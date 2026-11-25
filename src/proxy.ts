import { type NextRequest, NextResponse } from "next/server";

/**
 * Cheap gate only: is a session cookie present? The authoritative role check runs server-side
 * in each area's layout (get-session). Kept self-contained: proxy must not share modules.
 */
const PATH_HEADER = "x-kejalink-path";
const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (hasSession) {
    // Lets the area layout build /login?next=… if the session turns out to be invalid.
    const headers = new Headers(request.headers);
    headers.set(PATH_HEADER, `${pathname}${search}`);
    return NextResponse.next({ request: { headers } });
  }

  const login = request.nextUrl.clone();
  login.pathname = "/login";
  login.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/seeker/:path*", "/tenant/:path*", "/admin/:path*"],
};
