import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { parseEstimatedValue } from "@/lib/permits/value";
import { updatePriorityScores } from "@/lib/scoring/update-priority-scores";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingSchemaError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type PermitValueRow = {
  id: string;
  estimated_value: number | string | null;
  raw_data: Record<string, unknown> | null;
};

async function isAuthorized(request: NextRequest) {
  const serverEnv = getServerEnv();
  const authHeader = request.headers.get("authorization");

  if (authHeader === `Bearer ${serverEnv.CRON_SECRET}`) {
    return true;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return Boolean(user);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("permits").select("id, estimated_value, raw_data");

    if (error) {
      throw error;
    }

    const permits = (data ?? []) as PermitValueRow[];
    let updated = 0;

    for (const permit of permits) {
      const rawEstimate = permit.raw_data?.ESTVALUE ?? permit.estimated_value;
      const parsedValue = parseEstimatedValue(rawEstimate);
      const currentValue = parseEstimatedValue(permit.estimated_value);

      if (parsedValue !== currentValue) {
        const { error: updateError } = await admin
          .from("permits")
          .update({ estimated_value: parsedValue })
          .eq("id", permit.id);

        if (updateError) {
          throw updateError;
        }

        updated += 1;
      }
    }

    let rescored = 0;

    try {
      const scoringResult = await updatePriorityScores();
      rescored = scoringResult.updatedCount;
    } catch (error) {
      if (!isMissingSchemaError(error)) {
        throw error;
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/analytics");

    return NextResponse.json({
      scanned: permits.length,
      updated,
      rescored,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Failed to fix estimated values";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
