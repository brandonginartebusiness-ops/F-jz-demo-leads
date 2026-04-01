import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { updatePriorityScores } from "@/lib/scoring/update-priority-scores";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await updatePriorityScores();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/analytics");

    return NextResponse.json({ updated: result.updatedCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to score permits";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
