import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login"];

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Use getSession() here — it reads from the cookie without a network call,
  // keeping middleware under Vercel's 50ms Edge Runtime CPU limit.
  // Server components and route handlers use getUser() for authoritative validation.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );
  const isDashboardPath = request.nextUrl.pathname.startsWith("/dashboard");

  if (!user && isDashboardPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (!isPublicPath && request.nextUrl.pathname === "/") {
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
