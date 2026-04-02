import { createAdminClient } from "@/lib/supabase/admin";
import type { PermitRecord } from "@/lib/types";

const ARCGIS_ENDPOINT =
  "https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/ArcGIS/rest/services/miamidade_permit_data/FeatureServer/0/query";

type ArcGisFeature = {
  attributes: {
    PermitNumber?: string;
    PermitType?: string;
    ContractorName?: string;
    PermitIssuedDate?: string;
    DetailDescriptionComments?: string;
  };
};

type ArcGisResponse = {
  features?: ArcGisFeature[];
};

export async function runPermitEnrichment(permits: PermitRecord[]) {
  const admin = createAdminClient();

  for (const permit of permits) {
    if (!permit.folio_number) continue;

    try {
      const where = `FolioNumber='${permit.folio_number.replace(/'/g, "''")}'`;
      const params = new URLSearchParams({
        where,
        outFields: "PermitNumber,PermitType,ContractorName,PermitIssuedDate,DetailDescriptionComments",
        f: "json",
        returnGeometry: "false",
        resultRecordCount: "200",
        orderByFields: "PermitIssuedDate DESC",
      });

      const response = await fetch(`${ARCGIS_ENDPOINT}?${params.toString()}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });

      if (!response.ok) continue;

      const data = (await response.json()) as ArcGisResponse;
      const trades = (data.features ?? []).map((f) => f.attributes);

      const tradeTypes = Array.from(new Set(trades.map((t) => t.PermitType?.trim()).filter(Boolean))) as string[];
      const contractors = Array.from(new Set(trades.map((t) => t.ContractorName?.trim()).filter(Boolean))) as string[];
      const activityScore = Math.min(trades.length * 10, 100);

      // Find primary GC: most recent BLDG permit contractor
      const primaryGC = trades
        .filter((t) => t.PermitType === "BLDG")
        .sort((a, b) => {
          const da = a.PermitIssuedDate ? new Date(a.PermitIssuedDate).getTime() : 0;
          const db = b.PermitIssuedDate ? new Date(b.PermitIssuedDate).getTime() : 0;
          return db - da;
        })[0]?.ContractorName?.trim() ?? null;

      await admin.from("permit_ecosystem").upsert(
        {
          permit_id: permit.id,
          folio: permit.folio_number,
          related_permit_count: trades.length,
          trade_types: tradeTypes,
          sub_contractors: contractors,
          primary_gc: primaryGC,
          activity_score: activityScore,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "permit_id" },
      );
    } catch {
      // Non-fatal: continue to next permit
    }
  }
}
