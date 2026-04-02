import { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { runPermitEnrichment } from "@/lib/agents/permit-enrichment-agent";
import { runDeveloperLookup } from "@/lib/agents/developer-lookup-agent";
import { runGCProfiler } from "@/lib/agents/gc-profiler-agent";
import { runCloseProbability } from "@/lib/agents/close-probability-agent";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PermitRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: NextRequest) {
  const serverEnv = getServerEnv();
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${serverEnv.CRON_SECRET}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { permitId?: string };
    if (!body.permitId) {
      return NextResponse.json({ error: "permitId is required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("permits")
      .select("*")
      .eq("id", body.permitId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Permit not found" }, { status: 404 });
    }

    const permits = [data as PermitRecord];
    await runPermitEnrichment(permits);
    await runDeveloperLookup(permits);
    await runGCProfiler(permits);
    await runCloseProbability(permits);

    return NextResponse.json({ success: true, permitId: body.permitId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Enrichment failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
