import { ArcGisFeature } from "@/lib/permits/normalize";

const ARCGIS_ENDPOINT =
  "https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/ArcGIS/rest/services/BuildingPermit_gdb/FeatureServer/0/query";

const WHERE_CLAUSE =
  "TYPE='BLDG' AND DESC1 LIKE '%DEMOL%' AND RESCOMM='C'";

const OUT_FIELDS = [
  "ADDRESS",
  "STNDADDR",
  "TYPE",
  "DESC1",
  "APPTYPE",
  "ESTVALUE",
  "ISSUDATE",
  "CONTRNAME",
  "BPSTATUS",
  "RESCOMM",
  "FOLIO",
];

type ArcGisResponse = {
  features?: ArcGisFeature[];
  exceededTransferLimit?: boolean;
};

function buildQueryUrl(offset: number) {
  const params = new URLSearchParams({
    where: WHERE_CLAUSE,
    outFields: OUT_FIELDS.join(","),
    f: "json",
    returnGeometry: "false",
    resultOffset: String(offset),
    resultRecordCount: "200",
  });

  return `${ARCGIS_ENDPOINT}?${params.toString()}`;
}

export async function fetchCommercialDemolitionPermits() {
  const features: ArcGisFeature[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(buildQueryUrl(offset), {
      next: { revalidate: 0 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`ArcGIS request failed with ${response.status}`);
    }

    const payload = (await response.json()) as ArcGisResponse;
    const batch = payload.features ?? [];

    features.push(...batch);

    hasMore = Boolean(payload.exceededTransferLimit) || batch.length === 200;
    offset += batch.length;

    if (batch.length === 0) {
      hasMore = false;
    }
  }

  return features;
}
