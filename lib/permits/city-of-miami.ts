import { parseEstimatedValue, parseInteger } from "@/lib/permits/value";
import { classifyLeadType } from "@/lib/permits/lead-type";

const ENDPOINT =
  "https://services1.arcgis.com/CvuPhqcTQpZPT9qY/arcgis/rest/services/Building_Permits_Since_2014/FeatureServer/0/query";

const OUT_FIELDS = [
  "PermitNumber",
  "ProcessNumber",
  "ScopeofWork",
  "WorkItems",
  "CompanyName",
  "CompanyAddress",
  "CompanyCity",
  "CompanyZip",
  "TotalCost",
  "DeliveryAddress",
  "FolioNumber",
  "IssuedDate",
  "FirstSubmissionDate",
  "BuildingPermitStatusDescription",
  "PropertyType",
  "TotalSQFT",
  "Miami21Zone",
  "IsPermitFinal",
].join(",");

type CityOfMiamiFeature = {
  attributes: {
    PermitNumber?: string | null;
    ProcessNumber?: string | null;
    ScopeofWork?: string | null;
    WorkItems?: string | null;
    CompanyName?: string | null;
    CompanyAddress?: string | null;
    CompanyCity?: string | null;
    CompanyZip?: string | number | null;
    TotalCost?: string | number | null;
    DeliveryAddress?: string | null;
    FolioNumber?: string | number | null;
    IssuedDate?: number | null;          // epoch milliseconds
    FirstSubmissionDate?: number | null; // epoch milliseconds
    BuildingPermitStatusDescription?: string | null;
    PropertyType?: string | null;
    TotalSQFT?: string | number | null;
    Miami21Zone?: string | null;
    IsPermitFinal?: string | null;
  };
};

type CityOfMiamiResponse = {
  features?: CityOfMiamiFeature[];
  exceededTransferLimit?: boolean;
};

type FetchOptions = {
  fullSync?: boolean;
};

// IssuedDate comes as epoch milliseconds from City of Miami
function parseEpochDate(value: number | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
}

// FolioNumber comes as a plain number from City of Miami (no dashes)
function normalizeFolio(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return String(value).trim() || null;
}

function buildWhereClause(options: FetchOptions): string {
  const base = "ScopeofWork='DEMOLITION' AND PropertyType='Commercial'";

  if (options.fullSync) {
    return base;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  // ArcGIS esriFieldTypeDate requires TIMESTAMP syntax, not epoch ms
  const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

  return `${base} AND IssuedDate >= TIMESTAMP '${dateStr} 00:00:00'`;
}

export type NormalizedCityOfMiamiPermit = ReturnType<typeof normalizeCityOfMiamiPermit>;

export function normalizeCityOfMiamiPermit(feature: CityOfMiamiFeature) {
  const a = feature.attributes;
  const permitNumber = a.PermitNumber?.trim();
  if (!permitNumber) return null;

  const scopeOfWork = a.ScopeofWork?.trim() || null;
  const workItems = a.WorkItems?.trim() || null;

  return {
    permit_number: permitNumber,
    process_number: a.ProcessNumber?.trim() || null,
    master_permit_number: null,
    folio_number: normalizeFolio(a.FolioNumber),
    permit_type: scopeOfWork,
    application_type_code: null,
    application_type_description: scopeOfWork,
    proposed_use_code: null,
    proposed_use_description: a.Miami21Zone?.trim() || null,
    detail_description: workItems,
    residential_commercial: "C", // we only fetch Commercial from this source
    lead_type: classifyLeadType(scopeOfWork, workItems),
    permit_issued_date: parseEpochDate(a.IssuedDate),
    application_date: a.FirstSubmissionDate
      ? new Date(a.FirstSubmissionDate).toISOString()
      : null,
    last_inspection_date: null,
    last_approved_insp_date: null,
    cocc_date: null,
    property_address: a.DeliveryAddress?.trim() || null,
    legal_description_1: null,
    legal_description_2: null,
    city: "MIAMI",
    state: "FL",
    estimated_value: parseEstimatedValue(a.TotalCost),
    permit_total_fee: null,
    square_footage: parseInteger(a.TotalSQFT),
    structure_units: null,
    structure_floors: null,
    owner_name: null,
    contractor_number: null,
    contractor_name: a.CompanyName?.trim() || null,
    contractor_address: a.CompanyAddress?.trim() || null,
    contractor_city: a.CompanyCity?.trim() || null,
    contractor_state: "FL",
    contractor_zip: a.CompanyZip != null ? String(a.CompanyZip).trim() || null : null,
    contractor_phone: null,
    architect_name: null,
    raw_data: a as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchCityOfMiamiDemolitionPermits(options: FetchOptions = {}) {
  const permits: NonNullable<NormalizedCityOfMiamiPermit>[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      where: buildWhereClause(options),
      outFields: OUT_FIELDS,
      orderByFields: "IssuedDate DESC",
      f: "json",
      returnGeometry: "false",
      resultOffset: String(offset),
      resultRecordCount: "2000",
    });

    const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`City of Miami ArcGIS request failed: ${response.status}`);
    }

    const payload = (await response.json()) as CityOfMiamiResponse;
    const batch = payload.features ?? [];

    for (const feature of batch) {
      const normalized = normalizeCityOfMiamiPermit(feature);
      if (normalized) permits.push(normalized);
    }

    hasMore = Boolean(payload.exceededTransferLimit) || batch.length === 2000;
    offset += batch.length;

    if (batch.length === 0) hasMore = false;
  }

  return permits;
}
