import { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { runPermitEnrichment } from "@/lib/agents/permit-enrichment-agent";
import { runDeveloperLookup } from "@/lib/agents/developer-lookup-agent";
import { runGCProfiler } from "@/lib/agents/gc-profiler-agent";
import { runCloseProbability } from "@/lib/agents/close-probability-agent";
import { fetchCommercialDemolitionPermits } from "@/lib/permits/arcgis";
import { normalizePermit } from "@/lib/permits/normalize";
import { calculatePriority } from "@/lib/scoring/calculate-priority";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PermitRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: NextRequest) {
  const serverEnv = getServerEnv();
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${serverEnv.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const fullSync = searchParams.get("mode") === "full";
    const startedAt = Date.now();

    // Step 1: Sync new permits from ArcGIS
    const features = await fetchCommercialDemolitionPermits({ fullSync });
    const fetchCompletedAt = Date.now();

    let skipped = 0;
    const dedupedPermits = new Map<string, ReturnType<typeof normalizePermit>>();

    for (const feature of features) {
      const permit = normalizePermit(feature);

      if (!permit?.permit_number) {
        skipped += 1;
        continue;
      }

      const scoredPermit = {
        ...permit,
        priority_score: calculatePriority(permit).score,
      };

      dedupedPermits.set(scoredPermit.permit_number, scoredPermit);
    }

    const permits = Array.from(dedupedPermits.values());
    const permitNumbers = permits.map((p) => p?.permit_number).filter(Boolean) as string[];
    const { data: existingPermits, error: existingPermitsError } = permitNumbers.length
      ? await admin
          .from("permits")
          .select("permit_number")
          .in("permit_number", permitNumbers)
      : { data: [], error: null };

    if (existingPermitsError) throw existingPermitsError;

    const existingPermitNumbers = new Set(
      (existingPermits ?? []).map((p) => p.permit_number),
    );
    const newPermitNumbers = permits
      .filter((p) => p?.permit_number && !existingPermitNumbers.has(p.permit_number))
      .map((p) => p?.permit_number as string);

    const { error } = await admin.from("permits").upsert(permits, {
      onConflict: "permit_number",
      ignoreDuplicates: false,
    });

    if (error) throw error;

    // Log new permits to activity feed
    if (newPermitNumbers.length > 0) {
      const { data: insertedPermits, error: insertedPermitsError } = await admin
        .from("permits")
        .select("id, permit_number")
        .in("permit_number", newPermitNumbers);

      if (insertedPermitsError) throw insertedPermitsError;

      if ((insertedPermits ?? []).length > 0) {
        const { error: activityError } = await admin.from("activity_feed").insert(
          insertedPermits.map((p) => ({
            permit_id: p.id,
            action_type: "permit_synced",
            old_value: null,
            new_value: p.permit_number,
            note: null,
          })),
        );
        if (activityError) throw activityError;
      }
    }

    const syncCompletedAt = Date.now();

    // Step 2-5: Run intelligence agents on new/unenriched permits
    // Fetch full permit records for agent pipeline (max 10 to stay in time budget)
    const { data: agentPermits } = await admin
      .from("permits")
      .select("*")
      .or("close_probability_score.is.null,close_probability_score.eq.0")
      .order("priority_score", { ascending: false, nullsFirst: false })
      .limit(10);

    const permitRecords = (agentPermits ?? []) as PermitRecord[];
    let agentResult = { enriched: 0, error: null as string | null };

    if (permitRecords.length > 0) {
      try {
        // Step 2: Enrich each permit with related trades
        await runPermitEnrichment(permitRecords);

        // Step 3: Look up property owners
        await runDeveloperLookup(permitRecords);

        // Step 4: Profile GCs found in enrichment
        await runGCProfiler(permitRecords);

        // Step 5: Score close probability for all updated permits
        await runCloseProbability(permitRecords);

        agentResult = { enriched: permitRecords.length, error: null };
      } catch (agentError) {
        agentResult = {
          enriched: 0,
          error: agentError instanceof Error ? agentError.message : "Agent pipeline failed",
        };
      }
    }

    return NextResponse.json({
      success: true,
      mode: fullSync ? "full" : "recent",
      fetched: features.length,
      upserted: permits.length,
      skipped,
      newPermitsLogged: newPermitNumbers.length,
      agents: agentResult,
      timings: {
        fetchMs: fetchCompletedAt - startedAt,
        syncMs: syncCompletedAt - startedAt,
        totalMs: Date.now() - startedAt,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync permits";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
