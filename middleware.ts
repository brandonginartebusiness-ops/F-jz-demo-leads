import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

// Check for a Supabase session cookie without instantiating a client.
// Any Supabase auth client call (getUser, getSession) can trigger a token-refresh
// network request, which exceeds Vercel Edge Runtime's 50ms CPU limit.
// Reading cookies directly is synchronous and instant.
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    ({ name, value }) => /^sb-.+-auth-token/.test(name) && value.length > 0,
  );
}

export function middleware(request: NextRequest) {
  const isPublicPath = PUBLIC_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );
  const isDashboardPath = request.nextUrl.pathname.startsWith("/dashboard");
  const hasSession = hasSessionCookie(request);

  if (!hasSession && isDashboardPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (!isPublicPath && request.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
