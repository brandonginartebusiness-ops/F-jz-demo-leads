import { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { upsertGcProfile } from "@/lib/agents/gc-profiler-agent";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: NextRequest) {
  const serverEnv = getServerEnv();
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${serverEnv.CRON_SECRET}`;
}

type RouteParams = { params: { name: string } };

export async function GET(request: NextRequest, { params }: RouteParams) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contractorName = decodeURIComponent(params.name);

  try {
    // Check for cached profile first
    const admin = createAdminClient();
    const { data: cached } = await admin
      .from("gc_profiles")
      .select("*")
      .eq("contractor_name", contractorName)
      .single();

    if (cached) {
      const updatedAt = new Date(cached.updated_at as string);
      const hoursSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60);

      // Return cached if less than 24 hours old
      if (hoursSinceUpdate < 24) {
        return NextResponse.json({ success: true, profile: cached, cached: true });
      }
    }

    // Refresh profile
    const profile = await upsertGcProfile(contractorName);
    return NextResponse.json({ success: true, profile, cached: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch GC profile";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
