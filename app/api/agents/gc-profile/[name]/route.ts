import { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { runGCProfiler } from "@/lib/agents/gc-profiler-agent";
import type { PermitRecord } from "@/lib/types";

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
    const admin = createAdminClient();

    // Check for cached profile
    const { data: cached } = await admin
      .from("gc_profiles")
      .select("*")
      .eq("contractor_name", contractorName)
      .single();

    if (cached) {
      const updatedAt = new Date(cached.updated_at as string);
      const hoursSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceUpdate < 24) {
        return NextResponse.json({ success: true, profile: cached, cached: true });
      }
    }

    // Seed permit_ecosystem with this GC name so runGCProfiler picks it up
    await admin.from("permit_ecosystem").upsert(
      { permit_id: null, primary_gc: contractorName, folio: "manual", related_permit_count: 0, trade_types: [], sub_contractors: [], activity_score: 0, updated_at: new Date().toISOString() },
      { onConflict: "permit_id", ignoreDuplicates: true },
    ).then(() => {});

    // Run profiler — it reads primary_gc from permit_ecosystem
    await runGCProfiler([] as unknown as PermitRecord[]);

    // Fetch updated profile
    const { data: profile } = await admin
      .from("gc_profiles")
      .select("*")
      .eq("contractor_name", contractorName)
      .single();

    return NextResponse.json({ success: true, profile, cached: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch GC profile";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
