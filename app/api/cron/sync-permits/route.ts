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
    const features = await fetchCommercialDemolitionPermits();

    let skipped = 0;
    const dedupedPermits = new Map<string, ReturnType<typeof normalizePermit>>();

    for (const permit of features.map(normalizePermit)) {
      if (!permit.folio) {
        skipped += 1;
        continue;
      }

      // ArcGIS can emit multiple rows for the same FOLIO, so keep the latest
      // observed record and send only one row per conflict key to Supabase.
      dedupedPermits.set(permit.folio, permit);
    }

    const permits = Array.from(dedupedPermits.values());
    const folios = permits.map((permit) => permit.folio).filter(Boolean) as string[];
    const { data: existingPermits, error: existingPermitsError } = folios.length
      ? await admin.from("permits").select("folio").in("folio", folios)
      : { data: [], error: null };

    if (existingPermitsError) {
      throw existingPermitsError;
    }

    const existingFolios = new Set((existingPermits ?? []).map((permit) => permit.folio));
    const newFolios = permits
      .filter((permit) => permit.folio && !existingFolios.has(permit.folio))
      .map((permit) => permit.folio as string);

    const { error } = await admin.from("permits").upsert(permits, {
      onConflict: "folio",
      ignoreDuplicates: false,
    });

    if (error) {
      throw error;
    }

    if (newFolios.length > 0) {
      const { data: insertedPermits, error: insertedPermitsError } = await admin
        .from("permits")
        .select("id, folio")
        .in("folio", newFolios);

      if (insertedPermitsError) {
        throw insertedPermitsError;
      }

      if ((insertedPermits ?? []).length > 0) {
        const { error: activityError } = await admin.from("activity_feed").insert(
          insertedPermits.map((permit) => ({
            permit_id: permit.id,
            action_type: "permit_synced",
            old_value: null,
            new_value: permit.folio,
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
      fetched: features.length,
      upserted: permits.length,
      skipped,
      newPermitsLogged: newFolios.length,
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
