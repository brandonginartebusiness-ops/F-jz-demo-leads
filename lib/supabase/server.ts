import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getClientEnv } from "@/lib/env";

export function createClient() {
  const cookieStore = cookies();
  const clientEnv = getClientEnv();

  return createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          // Server Components can read cookies but must not mutate them.
          // Auth cookie refreshes are handled in middleware/route handlers.
        },
        remove() {
          // Server Components can read cookies but must not mutate them.
          // Auth cookie refreshes are handled in middleware/route handlers.
        },
      },
    },
  );
}
