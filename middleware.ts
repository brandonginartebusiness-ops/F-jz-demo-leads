// Auth is handled in server components:
//   - app/dashboard/layout.tsx  → redirects unauthenticated users to /login
//   - app/login/page.tsx        → redirects authenticated users to /dashboard
//
// The empty matcher below ensures this file is never invoked, which eliminates
// any risk of MIDDLEWARE_INVOCATION_TIMEOUT on Vercel Edge Runtime.
export const config = {
  matcher: [],
};
