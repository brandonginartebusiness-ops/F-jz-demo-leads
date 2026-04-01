import { User } from "@supabase/supabase-js";

import { getServerEnv } from "@/lib/env";

const DEFAULT_INTERNAL_ADMIN_DOMAIN = "jzdemolition.com";

export function isInternalAdmin(user: User | null | undefined) {
  const email = user?.email?.trim().toLowerCase();

  if (!email) {
    return false;
  }

  const serverEnv = getServerEnv();
  const allowedEmails = new Set(
    (serverEnv.INTERNAL_ADMIN_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );

  if (allowedEmails.has(email)) {
    return true;
  }

  const domain = (serverEnv.INTERNAL_ADMIN_DOMAIN || DEFAULT_INTERNAL_ADMIN_DOMAIN)
    .trim()
    .toLowerCase();

  return email.endsWith(`@${domain}`);
}
