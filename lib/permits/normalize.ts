import { parseEstimatedValue } from "@/lib/permits/value";

type ArcGisAttributes = {
  ADDRESS?: string | null;
  STNDADDR?: string | null;
  DESC1?: string | null;
  ESTVALUE?: string | null;
  ISSUDATE?: number | null;
  CONTRNAME?: string | null;
  BPSTATUS?: string | null;
  RESCOMM?: string | null;
  FOLIO?: string | null;
};

export type ArcGisFeature = {
  attributes: ArcGisAttributes;
};

export function mapStatus(status: string | null | undefined) {
  switch (status) {
    case "A":
      return "Active";
    case "E":
      return "Expired";
    case "F":
      return "Finalized";
    default:
      return status?.trim() || null;
  }
}

export function parseIssuedDate(value: number | null | undefined) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function normalizePermit(feature: ArcGisFeature) {
  const attributes = feature.attributes;
  const folio = attributes.FOLIO?.trim() || null;

  return {
    folio,
    address: attributes.ADDRESS?.trim() || null,
    standardized_address: attributes.STNDADDR?.trim() || null,
    description: attributes.DESC1?.trim() || null,
    estimated_value: parseEstimatedValue(attributes.ESTVALUE),
    issued_date: parseIssuedDate(attributes.ISSUDATE),
    contractor_name: attributes.CONTRNAME?.trim() || null,
    status: mapStatus(attributes.BPSTATUS),
    residential_commercial: attributes.RESCOMM?.trim() || null,
    raw_data: attributes,
  };
}
