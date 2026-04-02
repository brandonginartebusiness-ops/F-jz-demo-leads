import { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { runPermitEnrichment } from "@/lib/agents/permit-enrichment-agent";
import { runDeveloperLookup } from "@/lib/agents/developer-lookup-agent";
import { runGCProfiler } from "@/lib/agents/gc-profiler-agent";
import { runCloseProbability } from "@/lib/agents/close-probability-agent";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PermitRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

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
    const body = (await request.json()) as { permitIds?: string[]; batchSize?: number };
    const batchSize = Math.min(body.batchSize ?? 10, 10);
    const admin = createAdminClient();

    let permits: PermitRecord[];
    if (body.permitIds && body.permitIds.length > 0) {
      const { data, error } = await admin
        .from("permits")
        .select("*")
        .in("id", body.permitIds.slice(0, batchSize));
      if (error) throw error;
      permits = (data ?? []) as PermitRecord[];
    } else {
      const { data, error } = await admin
        .from("permits")
        .select("*")
        .or("close_probability_score.is.null,close_probability_score.eq.0")
        .order("priority_score", { ascending: false, nullsFirst: false })
        .limit(batchSize);
      if (error) throw error;
      permits = (data ?? []) as PermitRecord[];
    }

    if (permits.length === 0) {
      return NextResponse.json({ success: true, enriched: 0, message: "No permits to enrich" });
    }

    await runPermitEnrichment(permits);
    await runDeveloperLookup(permits);
    await runGCProfiler(permits);
    await runCloseProbability(permits);

    return NextResponse.json({ success: true, enriched: permits.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Batch enrichment failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
