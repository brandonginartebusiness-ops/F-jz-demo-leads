import { createAdminClient } from "@/lib/supabase/admin";

const ARCGIS_ENDPOINT =
  "https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/ArcGIS/rest/services/miamidade_permit_data/FeatureServer/0/query";

type ArcGisGcFeature = {
  attributes: {
    PermitNumber?: string;
    PropertyAddress?: string;
    EstimatedValue?: number | string;
    PermitIssuedDate?: string;
    ApplicationTypeDescription?: string;
    DetailDescriptionComments?: string;
    ResidentialCommercial?: string;
  };
};

type ArcGisResponse = {
  features?: ArcGisGcFeature[];
  exceededTransferLimit?: boolean;
};

export type GcProfile = {
  contractor_name: string;
  total_jobs: number;
  demo_jobs: number;
  total_value: number;
  avg_value: number;
  first_seen: string | null;
  last_seen: string | null;
  top_addresses: Array<{ address: string; count: number }>;
};

function isDemoPermit(feature: ArcGisGcFeature): boolean {
  const type = (feature.attributes.ApplicationTypeDescription ?? "").toUpperCase();
  const desc = (feature.attributes.DetailDescriptionComments ?? "").toUpperCase();
  return type.includes("DEMOL") || desc.includes("DEMO");
}

function parseValue(val: string | number | null | undefined): number {
  if (val === null || val === undefined) return 0;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return Number.isNaN(num) ? 0 : num;
}

function parseDate(val: string | null | undefined): string | null {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
}

async function fetchGcPermits(contractorName: string): Promise<ArcGisGcFeature[]> {
  const features: ArcGisGcFeature[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const where = `ContractorName='${contractorName.replace(/'/g, "''")}'`;
    const params = new URLSearchParams({
      where,
      outFields: "PermitNumber,PropertyAddress,EstimatedValue,PermitIssuedDate,ApplicationTypeDescription,DetailDescriptionComments,ResidentialCommercial",
      f: "json",
      returnGeometry: "false",
      resultOffset: String(offset),
      resultRecordCount: "500",
      orderByFields: "PermitIssuedDate DESC",
    });

    const response = await fetch(`${ARCGIS_ENDPOINT}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!response.ok) break;

    const data = (await response.json()) as ArcGisResponse;
    const batch = data.features ?? [];
    features.push(...batch);

    hasMore = Boolean(data.exceededTransferLimit) || batch.length === 500;
    offset += batch.length;
    if (batch.length === 0) hasMore = false;
  }

  return features;
}

export async function profileContractor(contractorName: string): Promise<GcProfile> {
  const features = await fetchGcPermits(contractorName);

  const addressCounts = new Map<string, number>();
  let totalValue = 0;
  let demoJobs = 0;
  let firstSeen: string | null = null;
  let lastSeen: string | null = null;

  for (const f of features) {
    const value = parseValue(f.attributes.EstimatedValue);
    totalValue += value;

    if (isDemoPermit(f)) demoJobs++;

    const addr = f.attributes.PropertyAddress?.trim();
    if (addr) {
      addressCounts.set(addr, (addressCounts.get(addr) ?? 0) + 1);
    }

    const date = parseDate(f.attributes.PermitIssuedDate);
    if (date) {
      if (!firstSeen || date < firstSeen) firstSeen = date;
      if (!lastSeen || date > lastSeen) lastSeen = date;
    }
  }

  const topAddresses = Array.from(addressCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([address, count]) => ({ address, count }));

  return {
    contractor_name: contractorName,
    total_jobs: features.length,
    demo_jobs: demoJobs,
    total_value: totalValue,
    avg_value: features.length > 0 ? Math.round(totalValue / features.length) : 0,
    first_seen: firstSeen,
    last_seen: lastSeen,
    top_addresses: topAddresses,
  };
}

export async function upsertGcProfile(contractorName: string): Promise<GcProfile> {
  const admin = createAdminClient();
  const profile = await profileContractor(contractorName);

  await admin.from("gc_profiles").upsert(
    {
      contractor_name: profile.contractor_name,
      total_jobs: profile.total_jobs,
      demo_jobs: profile.demo_jobs,
      total_value: profile.total_value,
      avg_value: profile.avg_value,
      first_seen: profile.first_seen,
      last_seen: profile.last_seen,
      top_addresses: profile.top_addresses,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "contractor_name", ignoreDuplicates: false },
  );

  return profile;
}
