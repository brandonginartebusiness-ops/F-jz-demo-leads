import { createAdminClient } from "@/lib/supabase/admin";
import { calculatePriority } from "@/lib/scoring/calculate-priority";
import { PermitRecord } from "@/lib/types";

type ScoringPermitRow = Pick<
  PermitRecord,
  | "id"
  | "permit_issued_date"
  | "detail_description"
  | "estimated_value"
  | "residential_commercial"
  | "square_footage"
  | "structure_floors"
>;

export async function updatePriorityScores() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("permits")
    .select(
      "id, permit_issued_date, detail_description, estimated_value, residential_commercial, square_footage, structure_floors",
    );

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
    };
  });

  for (const update of updates) {
    const { error: updateError } = await admin
      .from("permits")
      .update({ priority_score: update.priority_score })
      .eq("id", update.id);

    if (updateError) {
      throw updateError;
    }
  }

  return { updatedCount: updates.length };
}
