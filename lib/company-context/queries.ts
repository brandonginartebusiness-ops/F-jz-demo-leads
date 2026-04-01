import { createClient } from "@/lib/supabase/server";

import { type CompanyContextRecord } from "./schema";

export async function getLatestCompanyContext() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("company_context")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as CompanyContextRecord | null;
}
