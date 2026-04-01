import { NextResponse } from "next/server";

import { getAnalyticsData } from "@/lib/analytics/queries";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getAnalyticsData();
    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load analytics";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
