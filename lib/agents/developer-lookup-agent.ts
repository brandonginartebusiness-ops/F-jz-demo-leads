import { createAdminClient } from "@/lib/supabase/admin";
import type { PermitRecord } from "@/lib/types";

type ParcelInfo = {
  ownership?: {
    name?: string;
    address?: string;
  };
};

type PropertyAppraiserResponse = {
  parcelInfos?: {
    parcelInfo?: ParcelInfo[];
  };
};

const CORP_INDICATORS = ["LLC", "INC", "CORP", "GROUP", "HOLDINGS", "ENTERPRISES", "L.L.C.", "COMPANY"];

function isCorporateOwner(name: string | null | undefined): boolean {
  if (!name) return false;
  const upper = name.toUpperCase();
  return CORP_INDICATORS.some((ind) => upper.includes(ind));
}

export async function runDeveloperLookup(permits: PermitRecord[]) {
  const admin = createAdminClient();

  for (const permit of permits) {
    if (!permit.folio_number) continue;

    try {
      const paResponse = await fetch(
        `https://www.miamidade.gov/Apps/PA/PApublicServiceProxy/PaDataDetailService.aspx?folioNumber=${encodeURIComponent(permit.folio_number)}&operation=GetPropertyParcelInfo`,
        { headers: { Accept: "application/json" }, next: { revalidate: 0 } },
      );

      if (!paResponse.ok) continue;

      const text = await paResponse.text();
      let ownerData: PropertyAppraiserResponse | null = null;
      try {
        ownerData = JSON.parse(text) as PropertyAppraiserResponse;
      } catch {
        continue;
      }

      const parcel = ownerData?.parcelInfos?.parcelInfo?.[0];
      const ownerName = parcel?.ownership?.name ?? null;
      const ownerAddress = parcel?.ownership?.address ?? null;
      const isCorp = isCorporateOwner(ownerName);

      // If corporate owner, research with Tavily
      let companyResearch: unknown = null;
      if (isCorp && process.env.TAVILY_API_KEY) {
        try {
          const research = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: process.env.TAVILY_API_KEY,
              query: `${ownerName} Miami real estate development projects`,
              search_depth: "basic",
              max_results: 3,
            }),
          });

          if (research.ok) {
            const resData = (await research.json()) as { results?: unknown };
            companyResearch = resData?.results ?? null;
          }
        } catch {
          // Non-fatal
        }
      }

      await admin.from("property_owners").upsert(
        {
          folio: permit.folio_number,
          owner_name: ownerName,
          owner_type: isCorp ? "corporate" : "individual",
          mailing_address: ownerAddress,
          company_research: companyResearch,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "folio" },
      );
    } catch {
      // Non-fatal: continue to next permit
    }
  }
}
