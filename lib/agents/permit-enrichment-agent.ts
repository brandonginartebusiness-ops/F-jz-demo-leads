import { createAdminClient } from "@/lib/supabase/admin";
import { PermitRecord } from "@/lib/types";

const ARCGIS_ENDPOINT =
  "https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/ArcGIS/rest/services/miamidade_permit_data/FeatureServer/0/query";

type ArcGisRelatedFeature = {
  attributes: {
    PermitNumber?: string;
    DetailDescriptionComments?: string;
    EstimatedValue?: number | string;
    PermitIssuedDate?: string;
    PropertyAddress?: string;
    FolioNumber?: string;
    OwnerName?: string;
  };
};

type ArcGisResponse = {
  features?: ArcGisRelatedFeature[];
};

type EnrichmentResult = {
  permitId: string;
  relatedCount: number;
  error?: string;
};

async function queryRelatedPermits(
  field: string,
  value: string,
  excludePermitNumber: string,
): Promise<ArcGisRelatedFeature[]> {
  const where = `${field}='${value.replace(/'/g, "''")}'  AND PermitNumber<>'${excludePermitNumber.replace(/'/g, "''")}'`;
  const params = new URLSearchParams({
    where,
    outFields: "PermitNumber,DetailDescriptionComments,EstimatedValue,PermitIssuedDate,PropertyAddress,FolioNumber,OwnerName",
    f: "json",
    returnGeometry: "false",
    resultRecordCount: "50",
    orderByFields: "PermitIssuedDate DESC",
  });

  const response = await fetch(`${ARCGIS_ENDPOINT}?${params.toString()}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!response.ok) return [];

  const data = (await response.json()) as ArcGisResponse;
  return data.features ?? [];
}

function parseValue(val: string | number | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return Number.isNaN(num) ? null : num;
}

function parseDate(val: string | null | undefined): string | null {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
}

export async function enrichPermitEcosystem(permit: PermitRecord): Promise<EnrichmentResult> {
  const admin = createAdminClient();
  const related: Array<{
    permit_id: string;
    related_permit_number: string;
    related_description: string | null;
    related_value: number | null;
    related_date: string | null;
    relationship_type: string;
  }> = [];

  try {
    // Query by address
    if (permit.property_address) {
      const addressResults = await queryRelatedPermits(
        "PropertyAddress",
        permit.property_address,
        permit.permit_number,
      );
      for (const f of addressResults) {
        if (f.attributes.PermitNumber) {
          related.push({
            permit_id: permit.id,
            related_permit_number: f.attributes.PermitNumber,
            related_description: f.attributes.DetailDescriptionComments ?? null,
            related_value: parseValue(f.attributes.EstimatedValue),
            related_date: parseDate(f.attributes.PermitIssuedDate),
            relationship_type: "same_address",
          });
        }
      }
    }

    // Query by folio
    if (permit.folio_number) {
      const folioResults = await queryRelatedPermits(
        "FolioNumber",
        permit.folio_number,
        permit.permit_number,
      );
      for (const f of folioResults) {
        const permitNum = f.attributes.PermitNumber;
        if (permitNum && !related.some((r) => r.related_permit_number === permitNum)) {
          related.push({
            permit_id: permit.id,
            related_permit_number: permitNum,
            related_description: f.attributes.DetailDescriptionComments ?? null,
            related_value: parseValue(f.attributes.EstimatedValue),
            related_date: parseDate(f.attributes.PermitIssuedDate),
            relationship_type: "same_folio",
          });
        }
      }
    }

    if (related.length > 0) {
      const { error } = await admin.from("permit_ecosystem").upsert(related, {
        onConflict: "permit_id,related_permit_number",
        ignoreDuplicates: false,
      });
      if (error) throw error;
    }

    return { permitId: permit.id, relatedCount: related.length };
  } catch (err) {
    return {
      permitId: permit.id,
      relatedCount: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
