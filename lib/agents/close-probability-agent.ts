import { createAdminClient } from "@/lib/supabase/admin";
import { PermitRecord } from "@/lib/types";

export type CloseFactors = {
  activity_score: number;
  activity_reason: string;
  gc_score: number;
  gc_reason: string;
  value_score: number;
  value_reason: string;
  owner_score: number;
  owner_reason: string;
  total: number;
};

type GcRow = { demo_jobs: number; total_jobs: number; avg_value: number };
type OwnerRow = { owner_type: string };

// ── Activity density (40pts max) ──
function scoreActivity(relatedPermitCount: number): { score: number; reason: string } {
  if (relatedPermitCount >= 10) return { score: 40, reason: `${relatedPermitCount} related permits — extremely active site` };
  if (relatedPermitCount >= 5) return { score: 30, reason: `${relatedPermitCount} related permits — very active site` };
  if (relatedPermitCount >= 3) return { score: 20, reason: `${relatedPermitCount} related permits — moderately active` };
  if (relatedPermitCount >= 1) return { score: 10, reason: `${relatedPermitCount} related permit(s) — some activity` };
  return { score: 0, reason: "No related permits found" };
}

// ── GC profile strength (30pts max) ──
function scoreGc(gcProfile: GcRow | null): { score: number; reason: string } {
  if (!gcProfile) return { score: 5, reason: "No GC profile available" };

  let score = 0;
  const parts: string[] = [];

  if (gcProfile.demo_jobs >= 10) {
    score += 15;
    parts.push(`${gcProfile.demo_jobs} demo jobs (repeat demo GC)`);
  } else if (gcProfile.demo_jobs >= 3) {
    score += 10;
    parts.push(`${gcProfile.demo_jobs} demo jobs`);
  } else if (gcProfile.demo_jobs >= 1) {
    score += 5;
    parts.push(`${gcProfile.demo_jobs} demo job(s)`);
  }

  if (gcProfile.total_jobs >= 50) {
    score += 15;
    parts.push(`${gcProfile.total_jobs} total jobs (major GC)`);
  } else if (gcProfile.total_jobs >= 20) {
    score += 10;
    parts.push(`${gcProfile.total_jobs} total jobs`);
  } else if (gcProfile.total_jobs >= 5) {
    score += 5;
    parts.push(`${gcProfile.total_jobs} total jobs`);
  }

  return { score: Math.min(score, 30), reason: parts.join("; ") || "Low GC activity" };
}

// ── Estimated value tier (20pts max) ──
function scoreValue(estimatedValue: number | null): { score: number; reason: string } {
  const val = estimatedValue ?? 0;
  if (val >= 5_000_000) return { score: 20, reason: `$${(val / 1_000_000).toFixed(1)}M — major project` };
  if (val >= 1_000_000) return { score: 15, reason: `$${(val / 1_000_000).toFixed(1)}M — large project` };
  if (val >= 500_000) return { score: 10, reason: `$${(val / 1000).toFixed(0)}K — mid-size project` };
  if (val >= 100_000) return { score: 5, reason: `$${(val / 1000).toFixed(0)}K — smaller project` };
  return { score: 0, reason: val > 0 ? `$${val.toLocaleString()} — low value` : "No value listed" };
}

// ── Property owner type (10pts max) ──
function scoreOwner(ownerType: string | null): { score: number; reason: string } {
  switch (ownerType) {
    case "corporation": return { score: 10, reason: "Corporate owner — likely developer" };
    case "llc": return { score: 8, reason: "LLC owner — likely investment entity" };
    case "trust": return { score: 6, reason: "Trust owner" };
    case "government": return { score: 3, reason: "Government owner — lower close rate" };
    case "individual": return { score: 5, reason: "Individual owner" };
    default: return { score: 2, reason: "Unknown owner type" };
  }
}

export async function calculateCloseProbability(permit: PermitRecord): Promise<CloseFactors> {
  const admin = createAdminClient();

  // Fetch ecosystem count
  const { count: ecosystemCount } = await admin
    .from("permit_ecosystem")
    .select("id", { count: "exact", head: true })
    .eq("permit_id", permit.id);

  // Fetch GC profile
  let gcRow: GcRow | null = null;
  if (permit.contractor_name) {
    const { data } = await admin
      .from("gc_profiles")
      .select("demo_jobs, total_jobs, avg_value")
      .eq("contractor_name", permit.contractor_name)
      .single();
    gcRow = data as GcRow | null;
  }

  // Fetch owner type
  let ownerType: string | null = null;
  if (permit.folio_number) {
    const { data } = await admin
      .from("property_owners")
      .select("owner_type")
      .eq("folio_number", permit.folio_number)
      .single();
    ownerType = (data as OwnerRow | null)?.owner_type ?? null;
  }

  const activity = scoreActivity(ecosystemCount ?? 0);
  const gc = scoreGc(gcRow);
  const value = scoreValue(permit.estimated_value);
  const owner = scoreOwner(ownerType);

  const total = Math.min(activity.score + gc.score + value.score + owner.score, 100);

  return {
    activity_score: activity.score,
    activity_reason: activity.reason,
    gc_score: gc.score,
    gc_reason: gc.reason,
    value_score: value.score,
    value_reason: value.reason,
    owner_score: owner.score,
    owner_reason: owner.reason,
    total,
  };
}

export async function scoreAndUpdatePermit(permit: PermitRecord): Promise<CloseFactors> {
  const admin = createAdminClient();
  const factors = await calculateCloseProbability(permit);

  await admin
    .from("permits")
    .update({
      close_probability: factors.total,
      close_factors: factors,
      enriched_at: new Date().toISOString(),
    })
    .eq("id", permit.id);

  return factors;
}
