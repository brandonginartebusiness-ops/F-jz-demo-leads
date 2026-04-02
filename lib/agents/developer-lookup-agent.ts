import { createAdminClient } from "@/lib/supabase/admin";

type OwnerType = "individual" | "corporation" | "llc" | "trust" | "government";

export type PropertyOwnerResult = {
  folio_number: string;
  owner_name: string | null;
  owner_type: OwnerType;
  mailing_address: string | null;
  assessed_value: number | null;
  land_use: string | null;
  research_notes: string | null;
  source: string;
};

type PropertyAppraiserResponse = {
  PropertyInfo?: {
    Owner1?: string;
    MailingAddress?: string;
    LandUse?: string;
    AssessedValue?: string | number;
  };
};

const CORP_INDICATORS = ["INC", "CORP", "CORPORATION", "CO.", "COMPANY", "GROUP", "HOLDINGS", "ENTERPRISES"];
const LLC_INDICATORS = ["LLC", "L.L.C.", "LIMITED LIABILITY"];
const TRUST_INDICATORS = ["TRUST", "TRUSTEE", "TR"];
const GOVT_INDICATORS = ["COUNTY", "CITY OF", "STATE OF", "MIAMI-DADE", "SCHOOL BOARD", "GOVERNMENT"];

function classifyOwner(name: string | null | undefined): OwnerType {
  if (!name) return "individual";
  const upper = name.toUpperCase();

  if (GOVT_INDICATORS.some((g) => upper.includes(g))) return "government";
  if (LLC_INDICATORS.some((g) => upper.includes(g))) return "llc";
  if (TRUST_INDICATORS.some((g) => upper.includes(g))) return "trust";
  if (CORP_INDICATORS.some((g) => upper.includes(g))) return "corporation";
  return "individual";
}

function parseAssessedValue(val: string | number | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[,$]/g, ""));
  return Number.isNaN(num) ? null : num;
}

async function fetchPropertyAppraiser(folioNumber: string): Promise<PropertyAppraiserResponse | null> {
  try {
    const url = `https://www.miamidade.gov/Apps/PA/PApublicServicesgis/PaaborSearchByFolio.aspx?folioNumber=${encodeURIComponent(folioNumber)}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!response.ok) return null;

    const text = await response.text();
    try {
      return JSON.parse(text) as PropertyAppraiserResponse;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

async function tavilyResearch(query: string): Promise<string | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: 3,
        include_answer: true,
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { answer?: string };
    return data.answer ?? null;
  } catch {
    return null;
  }
}

export async function lookupPropertyOwner(
  folioNumber: string,
  ownerNameHint?: string | null,
): Promise<PropertyOwnerResult> {
  // Try the property appraiser API
  const paData = await fetchPropertyAppraiser(folioNumber);
  const info = paData?.PropertyInfo;

  const ownerName = info?.Owner1 ?? ownerNameHint ?? null;
  const ownerType = classifyOwner(ownerName);

  // If owner looks like a company, try web research
  let researchNotes: string | null = null;
  if (ownerName && ownerType !== "individual" && ownerType !== "government") {
    researchNotes = await tavilyResearch(
      `${ownerName} Miami Florida real estate developer property`,
    );
  }

  return {
    folio_number: folioNumber,
    owner_name: ownerName,
    owner_type: ownerType,
    mailing_address: info?.MailingAddress ?? null,
    assessed_value: parseAssessedValue(info?.AssessedValue),
    land_use: info?.LandUse ?? null,
    research_notes: researchNotes,
    source: info ? "miami_dade_pa" : "permit_data",
  };
}

export async function upsertPropertyOwner(
  folioNumber: string,
  ownerNameHint?: string | null,
): Promise<PropertyOwnerResult> {
  const admin = createAdminClient();
  const result = await lookupPropertyOwner(folioNumber, ownerNameHint);

  await admin.from("property_owners").upsert(
    {
      folio_number: result.folio_number,
      owner_name: result.owner_name,
      owner_type: result.owner_type,
      mailing_address: result.mailing_address,
      assessed_value: result.assessed_value,
      land_use: result.land_use,
      research_notes: result.research_notes,
      source: result.source,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "folio_number", ignoreDuplicates: false },
  );

  return result;
}
