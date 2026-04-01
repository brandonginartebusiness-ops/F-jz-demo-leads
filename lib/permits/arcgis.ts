import { ArcGisFeature } from "@/lib/permits/normalize";

const ARCGIS_ENDPOINT =
  "https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/ArcGIS/rest/services/miamidade_permit_data/FeatureServer/0/query";

const OUT_FIELDS = [
  "PermitIssuedDate",
  "ApplicationDate",
  "PermitNumber",
  "ProcessNumber",
  "MasterPermitNumber",
  "PermitType",
  "ResidentialCommercial",
  "EstimatedValue",
  "ApplicationTypeCode",
  "ApplicationTypeDescription",
  "ProposedUseCode",
  "ProposedUseDescription",
  "DetailDescriptionComments",
  "FolioNumber",
  "OwnerName",
  "LegalDescription1",
  "LegalDescription2",
  "PropertyAddress",
  "ArchitectName",
  "ContractorNumber",
  "ContractorName",
  "ContractorAddress",
  "ContractorCity",
  "ContractorState",
  "ContractorZip",
  "ContractorPhone",
  "SquareFootage",
  "StructureUnits",
  "StructureFloors",
  "PermitTotalFee",
  "LastInspectionDate",
  "LastApprovedInspDate",
  "CoCcDate",
  "City",
  "State",
];

type ArcGisResponse = {
  features?: ArcGisFeature[];
  exceededTransferLimit?: boolean;
};

type FetchPermitsOptions = {
  fullSync?: boolean;
};

const DEMOLITION_WHERE_CLAUSE = [
  "(",
  "ApplicationTypeDescription LIKE '%DEMOL%'",
  "OR DetailDescriptionComments LIKE '%TOTAL DEMO%'",
  "OR DetailDescriptionComments LIKE '%COMPLETE DEMO%'",
  "OR DetailDescriptionComments LIKE '%FULL DEMO%'",
  "OR DetailDescriptionComments LIKE '%DEMO OF%'",
  "OR DetailDescriptionComments LIKE '%DEMOLITION%'",
  "OR DetailDescriptionComments LIKE '%INTERIOR DEMO%'",
  "OR DetailDescriptionComments LIKE '%PARTIAL DEMO%'",
  ")",
  "AND ResidentialCommercial='C'",
].join(" ");

function buildWhereClause(options: FetchPermitsOptions) {
  if (options.fullSync) {
    return DEMOLITION_WHERE_CLAUSE;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

  return `${DEMOLITION_WHERE_CLAUSE} AND PermitIssuedDate >= '${dateStr}'`;
}

function buildQueryUrl(offset: number, options: FetchPermitsOptions) {
  const params = new URLSearchParams({
    where: buildWhereClause(options),
    outFields: OUT_FIELDS.join(","),
    orderByFields: "PermitIssuedDate DESC",
    f: "json",
    returnGeometry: "false",
    resultOffset: String(offset),
    resultRecordCount: "2000",
  });

  return `${ARCGIS_ENDPOINT}?${params.toString()}`;
}

export async function fetchCommercialDemolitionPermits(options: FetchPermitsOptions = {}) {
  const features: ArcGisFeature[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(buildQueryUrl(offset, options), {
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

    hasMore = Boolean(payload.exceededTransferLimit) || batch.length === 2000;
    offset += batch.length;

    if (batch.length === 0) {
      hasMore = false;
    }
  }

  return features;
}
