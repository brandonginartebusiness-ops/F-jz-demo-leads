import { createAdminClient } from "@/lib/supabase/admin";
import type { PermitRecord } from "@/lib/types";

const HIGH_VALUE_AREAS = ["BRICKELL", "MIAMI BEACH", "CORAL GABLES", "DOWNTOWN", "DORAL", "AVENTURA"];

export async function runCloseProbability(permits: PermitRecord[]) {
  const admin = createAdminClient();

  for (const permit of permits) {
    try {
      // Load ecosystem data
      const { data: ecosystem } = await admin
        .from("permit_ecosystem")
        .select("*")
        .eq("permit_id", permit.id)
        .single();

      // Load GC profile if we have a primary GC
      let gcProfile: { active_permits_90d?: number } | null = null;
      const primaryGc = (ecosystem as { primary_gc?: string } | null)?.primary_gc;
      if (primaryGc) {
        const { data } = await admin
          .from("gc_profiles")
          .select("active_permits_90d")
          .eq("contractor_name", primaryGc)
          .single();
        gcProfile = data;
      }

      let score = 0;

      // ACTIVITY SIGNALS (40pts)
      const relatedCount = (ecosystem as { related_permit_count?: number } | null)?.related_permit_count ?? 0;
      if (relatedCount >= 5) score += 20;
      else if (relatedCount >= 2) score += 10;

      const daysOld = permit.permit_issued_date
        ? (Date.now() - new Date(permit.permit_issued_date).getTime()) / (1000 * 60 * 60 * 24)
        : 999;
      if (daysOld <= 30) score += 20;
      else if (daysOld <= 90) score += 10;

      // GC SIGNALS (30pts)
      const activeJobs = gcProfile?.active_permits_90d ?? 0;
      if (activeJobs >= 10) score += 30;
      else if (activeJobs >= 5) score += 20;
      else if (activeJobs >= 1) score += 10;

      // PROJECT VALUE SIGNALS (20pts)
      const value = permit.estimated_value ?? 0;
      if (value >= 500000) score += 20;
      else if (value >= 100000) score += 10;
      else score += 5;

      // PROPERTY SIGNALS (10pts)
      if (permit.residential_commercial === "C") score += 10;

      // HIGH VALUE AREAS BONUS
      const addr = (permit.property_address ?? "").toUpperCase();
      if (HIGH_VALUE_AREAS.some((area) => addr.includes(area))) score += 5;

      const finalScore = Math.min(score, 100);
      const label = finalScore >= 70 ? "Hot" : finalScore >= 40 ? "Warm" : "Low";

      await admin
        .from("permits")
        .update({
          close_probability_score: finalScore,
          close_probability_label: label,
        })
        .eq("id", permit.id);
    } catch {
      // Non-fatal: continue to next permit
    }
  }
}
