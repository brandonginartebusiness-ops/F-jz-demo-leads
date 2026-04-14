import { PermitRecord } from "@/lib/types";
import {
  COMMERCIAL_POINTS,
  DEMO_SPECIALIST_KEYWORDS,
  DESCRIPTION_KEYWORD_POINTS,
  DESCRIPTION_KEYWORDS,
  FLOORS_THRESHOLDS,
  ICP_MATCH_BONUS,
  LEAD_TYPE_POINTS,
  OPEN_SLOT_BONUS,
  PRIORITY_CORRIDOR_BONUS,
  PRIORITY_CORRIDORS,
  PRIORITY_THRESHOLD_HOT,
  PRIORITY_THRESHOLD_WARM,
  RECENCY_THRESHOLDS,
  SCORE_MAX,
  SCORE_MIN,
  SQFT_THRESHOLDS,
  VALUE_THRESHOLDS,
} from "@/lib/scoring/constants";

type IcpProfile = {
  property_types: string[] | null;
  locations: string[] | null;
};

type PriorityInput = Pick<
  PermitRecord,
  | "permit_issued_date"
  | "detail_description"
  | "estimated_value"
  | "lead_type"
  | "residential_commercial"
  | "square_footage"
  | "structure_floors"
  | "contractor_name"
  | "city"
  | "property_address"
>;

export function calculatePriority(input: PriorityInput, icpProfiles: IcpProfile[] = []) {
  const leadTypePoints = getLeadTypePoints(input.lead_type);
  const squareFootagePoints = getSquareFootagePoints(input.square_footage);
  const floorsPoints = getFloorsPoints(input.structure_floors);
  const valuePoints = getValuePoints(input.estimated_value);
  const commercialPoints = input.residential_commercial === "C" ? COMMERCIAL_POINTS : 0;
  const descriptionPoints = getDescriptionPoints(input.detail_description);
  const recencyPoints = getRecencyPoints(input.permit_issued_date);
  const openSlotPoints = getOpenSlotPoints(input.contractor_name);
  const corridorPoints = getCorridorPoints(input.city, input.property_address ?? null);
  const icpPoints = getIcpMatchPoints(input.residential_commercial, input.city, icpProfiles);

  const score =
    leadTypePoints +
    squareFootagePoints +
    floorsPoints +
    valuePoints +
    commercialPoints +
    descriptionPoints +
    recencyPoints +
    openSlotPoints +
    corridorPoints +
    icpPoints;

  return {
    score: Math.max(SCORE_MIN, Math.min(score, SCORE_MAX)),
    breakdown: {
      leadType: leadTypePoints,
      squareFootage: squareFootagePoints,
      floors: floorsPoints,
      value: valuePoints,
      commercial: commercialPoints,
      description: descriptionPoints,
      recency: recencyPoints,
      openSlot: openSlotPoints,
      corridor: corridorPoints,
      icp: icpPoints,
    },
  };
}

export function getPriorityLabel(score: number) {
  if (score >= PRIORITY_THRESHOLD_HOT) {
    return "Hot";
  }

  if (score >= PRIORITY_THRESHOLD_WARM) {
    return "Warm";
  }

  return "Low";
}

function getLeadTypePoints(leadType: PermitRecord["lead_type"]) {
  if (leadType === "full_demolition") {
    return LEAD_TYPE_POINTS.full_demolition;
  }

  if (leadType === "partial_demolition") {
    return LEAD_TYPE_POINTS.partial_demolition;
  }

  if (leadType === "demo_related") {
    return LEAD_TYPE_POINTS.demo_related;
  }

  if (leadType === "junk") {
    return LEAD_TYPE_POINTS.junk;
  }

  return LEAD_TYPE_POINTS.other;
}

function getSquareFootagePoints(squareFootage: number | null) {
  const value = squareFootage ?? 0;

  for (const tier of SQFT_THRESHOLDS) {
    if (value > tier.min) {
      return tier.points;
    }
  }

  return 0;
}

function getFloorsPoints(structureFloors: number | null) {
  const value = structureFloors ?? 0;

  for (const tier of FLOORS_THRESHOLDS) {
    if (value >= tier.min) {
      return tier.points;
    }
  }

  return 0;
}

function getValuePoints(estimatedValue: number | null) {
  const value = estimatedValue ?? 0;

  for (const tier of VALUE_THRESHOLDS) {
    if (value > tier.min) {
      return tier.points;
    }
  }

  return 0;
}

function getDescriptionPoints(detailDescription: string | null) {
  const normalized = detailDescription?.trim().toUpperCase() ?? "";

  if (DESCRIPTION_KEYWORDS.some((kw) => normalized.includes(kw))) {
    return DESCRIPTION_KEYWORD_POINTS;
  }

  return 0;
}

function getRecencyPoints(permitIssuedDate: string | null) {
  if (!permitIssuedDate) {
    return 0;
  }

  const issued = new Date(permitIssuedDate);
  const diffInDays = Math.floor((Date.now() - issued.getTime()) / 86400000);

  for (const tier of RECENCY_THRESHOLDS) {
    if (diffInDays <= tier.maxDays) {
      return tier.points;
    }
  }

  return 0;
}

// Open slot: if the contractor is not a demolition specialist, the sub slot is likely available.
// No contractor listed is also an open slot.
function getOpenSlotPoints(contractorName: string | null): number {
  if (!contractorName) return OPEN_SLOT_BONUS;

  const normalized = contractorName.toUpperCase();
  const isDemoSpecialist = DEMO_SPECIALIST_KEYWORDS.some((kw) => normalized.includes(kw));

  return isDemoSpecialist ? 0 : OPEN_SLOT_BONUS;
}

// Corridor bonus: permit is in a high-activity Miami-Dade demolition corridor.
// Checks both the city field and property address for corridor names.
function getCorridorPoints(city: string | null, propertyAddress: string | null): number {
  const haystack = `${city ?? ""} ${propertyAddress ?? ""}`.toUpperCase();

  const inCorridor = PRIORITY_CORRIDORS.some((corridor) => haystack.includes(corridor));
  return inCorridor ? PRIORITY_CORRIDOR_BONUS : 0;
}

// ICP match: permit matches an active Ideal Customer Profile on property type and/or location.
function getIcpMatchPoints(
  residentialCommercial: string | null,
  city: string | null,
  icpProfiles: IcpProfile[],
): number {
  if (icpProfiles.length === 0) return 0;

  const isCommercial = residentialCommercial === "C";
  const cityNorm = (city ?? "").toUpperCase().trim();

  for (const icp of icpProfiles) {
    const typesMatch = isCommercial && (icp.property_types ?? []).includes("commercial");
    const locationMatch =
      cityNorm.length > 0 &&
      (icp.locations ?? []).some((loc) => {
        const locNorm = loc.toUpperCase();
        return cityNorm.includes(locNorm) || locNorm.includes(cityNorm);
      });

    if (typesMatch && locationMatch) return ICP_MATCH_BONUS;
    if (typesMatch || locationMatch) return Math.floor(ICP_MATCH_BONUS / 2);
  }

  return 0;
}
