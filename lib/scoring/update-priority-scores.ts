import { createAdminClient } from "@/lib/supabase/admin";
import { calculatePriority } from "@/lib/scoring/calculate-priority";
import { PermitRecord } from "@/lib/types";

type ScoringPermitRow = Pick<
  PermitRecord,
  "id" | "issued_date" | "contractor_name" | "status" | "address" | "estimated_value"
>;

export async function updatePriorityScores() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("permits")
    .select("id, issued_date, contractor_name, status, address, estimated_value");

  if (error) {
    throw error;
  }

  const permits = (data ?? []) as ScoringPermitRow[];

  if (permits.length === 0) {
    return { updatedCount: 0 };
  }

  const updates = permits.map((permit) => {
    const priority = calculatePriority(permit);

    return {
      id: permit.id,
      priority_score: priority.score,
      priority_label: priority.label,
    };
  });

  const { error: updateError } = await admin.from("permits").upsert(updates, {
    onConflict: "id",
      ignoreDuplicates: false,
  });

  if (updateError) {
    throw updateError;
  }

  return { updatedCount: updates.length };
}
