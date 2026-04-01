import { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { fetchCommercialDemolitionPermits } from "@/lib/permits/arcgis";
import { normalizePermit } from "@/lib/permits/normalize";
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

    const { error } = await admin.from("permits").upsert(permits, {
      onConflict: "folio",
      ignoreDuplicates: false,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      fetched: features.length,
      upserted: permits.length,
      skipped,
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
