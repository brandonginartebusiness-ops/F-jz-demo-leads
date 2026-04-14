import { createAdminClient } from "@/lib/supabase/admin";
import { calculatePriority } from "@/lib/scoring/calculate-priority";
import { PermitRecord } from "@/lib/types";

const BATCH_SIZE = 50;

type ScoringPermitRow = Pick<
  PermitRecord,
  | "id"
  | "permit_issued_date"
  | "detail_description"
  | "estimated_value"
  | "lead_type"
  | "residential_commercial"
  | "square_footage"
  | "structure_floors"
  | "contractor_name"
  | "city"
  | "property_address"
>;

type IcpRow = {
  property_types: string[] | null;
  locations: string[] | null;
};

export async function updatePriorityScores() {
  const admin = createAdminClient();

  // Load active ICP profiles once so every permit can be scored against them.
  const { data: icpData } = await admin
    .from("icp_profiles")
    .select("property_types, locations")
    .eq("is_active", true);

  const icpProfiles: IcpRow[] = (icpData ?? []) as IcpRow[];

  const { data, error } = await admin
    .from("permits")
    .select(
      "id, permit_issued_date, detail_description, estimated_value, lead_type, residential_commercial, square_footage, structure_floors, contractor_name, city, property_address",
    );

  if (error) {
    throw error;
  }

  const permits = (data ?? []) as ScoringPermitRow[];

  if (permits.length === 0) {
    return { updatedCount: 0 };
  }

  const updates = permits.map((permit) => {
    const priority = calculatePriority(permit, icpProfiles);

    return {
      id: permit.id,
      priority_score: priority.score,
    };
  });

  // Run updates in parallel batches to avoid sequential N queries
  // while staying within connection-pool limits.
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const chunk = updates.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      chunk.map((update) =>
        admin.from("permits").update({ priority_score: update.priority_score }).eq("id", update.id),
      ),
    );

    for (const result of results) {
      if (result.error) {
        throw result.error;
      }
    }
  }

  return { updatedCount: updates.length };
}
