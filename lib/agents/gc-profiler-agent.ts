import { createAdminClient } from "@/lib/supabase/admin";
import type { PermitRecord } from "@/lib/types";

const ARCGIS_ENDPOINT =
  "https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/ArcGIS/rest/services/miamidade_permit_data/FeatureServer/0/query";

type ArcGisFeature = {
  attributes: {
    PermitType?: string;
    EstimatedValue?: string | number;
    PermitIssuedDate?: string;
    DetailDescriptionComments?: string;
    PropertyAddress?: string;
    City?: string;
  };
};

type ArcGisResponse = {
  features?: ArcGisFeature[];
  exceededTransferLimit?: boolean;
};

export async function runGCProfiler(_permits: PermitRecord[]) {
  const admin = createAdminClient();

  // Get unique GC names from permit_ecosystem
  const { data: ecosystems } = await admin
    .from("permit_ecosystem")
    .select("primary_gc")
    .not("primary_gc", "is", null);

  const uniqueGCs = Array.from(new Set((ecosystems ?? []).map((e) => e.primary_gc as string)));

  for (const gcName of uniqueGCs) {
    if (!gcName) continue;

    try {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
      const dateStr = twelveMonthsAgo.toISOString().split("T")[0];

      const where = `ContractorName='${gcName.replace(/'/g, "''")}' AND PermitIssuedDate >= '${dateStr}'`;
      const params = new URLSearchParams({
        where,
        outFields: "PermitType,EstimatedValue,PermitIssuedDate,DetailDescriptionComments,PropertyAddress,City",
        f: "json",
        returnGeometry: "false",
        resultRecordCount: "1000",
        orderByFields: "PermitIssuedDate DESC",
      });

      const response = await fetch(`${ARCGIS_ENDPOINT}?${params.toString()}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });

      if (!response.ok) continue;

      const data = (await response.json()) as ArcGisResponse;
      const allPermits = (data.features ?? []).map((f) => f.attributes);

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const activePermits = allPermits.filter((p) => {
        if (!p.PermitIssuedDate) return false;
        return new Date(p.PermitIssuedDate).getTime() >= ninetyDaysAgo.getTime();
      });

      const demoPermits = allPermits.filter((p) => {
        const desc = (p.DetailDescriptionComments ?? "").toUpperCase();
        return desc.includes("DEMOL") || desc.includes("DEMO");
      });

      const values = allPermits
        .map((p) => {
          const v = typeof p.EstimatedValue === "number" ? p.EstimatedValue : parseInt(String(p.EstimatedValue ?? "0"), 10);
          return Number.isNaN(v) ? 0 : v;
        })
        .filter((v) => v > 1);
      const avgValue = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

      const tradeTypes = Array.from(new Set(allPermits.map((p) => p.PermitType?.trim()).filter(Boolean))) as string[];
      const cities = Array.from(new Set(allPermits.map((p) => p.City?.trim()).filter(Boolean))) as string[];

      await admin.from("gc_profiles").upsert(
        {
          contractor_name: gcName,
          total_permits_12mo: allPermits.length,
          active_permits_90d: activePermits.length,
          avg_project_value: avgValue,
          primary_trades: tradeTypes,
          geo_focus: cities,
          demo_frequency: demoPermits.length,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "contractor_name" },
      );
    } catch {
      // Non-fatal: continue to next GC
    }
  }
}
