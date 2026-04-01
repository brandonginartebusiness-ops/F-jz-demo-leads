import { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { fetchCommercialDemolitionPermits } from "@/lib/permits/arcgis";
import { normalizePermit } from "@/lib/permits/normalize";
import { updatePriorityScores } from "@/lib/scoring/update-priority-scores";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    const features = await fetchCommercialDemolitionPermits({ fullSync });

    let skipped = 0;
    const dedupedPermits = new Map<string, ReturnType<typeof normalizePermit>>();

    for (const permit of features.map(normalizePermit)) {
      if (!permit?.permit_number) {
        skipped += 1;
        continue;
      }

      dedupedPermits.set(permit.permit_number, permit);
    }

    const permits = Array.from(dedupedPermits.values());
    const permitNumbers = permits.map((permit) => permit?.permit_number).filter(Boolean) as string[];
    const { data: existingPermits, error: existingPermitsError } = permitNumbers.length
      ? await admin
          .from("permits")
          .select("permit_number")
          .in("permit_number", permitNumbers)
      : { data: [], error: null };

    if (existingPermitsError) {
      throw existingPermitsError;
    }

    const existingPermitNumbers = new Set(
      (existingPermits ?? []).map((permit) => permit.permit_number),
    );
    const newPermitNumbers = permits
      .filter(
        (permit) =>
          permit?.permit_number && !existingPermitNumbers.has(permit.permit_number),
      )
      .map((permit) => permit?.permit_number as string);

    const { error } = await admin.from("permits").upsert(permits, {
      onConflict: "permit_number",
      ignoreDuplicates: false,
    });

    if (error) {
      throw error;
    }

    if (newPermitNumbers.length > 0) {
      const { data: insertedPermits, error: insertedPermitsError } = await admin
        .from("permits")
        .select("id, permit_number")
        .in("permit_number", newPermitNumbers);

      if (insertedPermitsError) {
        throw insertedPermitsError;
      }

      if ((insertedPermits ?? []).length > 0) {
        const { error: activityError } = await admin.from("activity_feed").insert(
          insertedPermits.map((permit) => ({
            permit_id: permit.id,
            action_type: "permit_synced",
            old_value: null,
            new_value: permit.permit_number,
            note: null,
          })),
        );

        if (activityError) {
          throw activityError;
        }
      }
    }

    const scoringResult = await updatePriorityScores();

    return NextResponse.json({
      success: true,
      mode: fullSync ? "full" : "recent",
      fetched: features.length,
      upserted: permits.length,
      skipped,
      newPermitsLogged: newPermitNumbers.length,
      scoredPermits: scoringResult.updatedCount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync permits";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
