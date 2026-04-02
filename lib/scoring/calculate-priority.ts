import { PermitRecord } from "@/lib/types";
import {
  COMMERCIAL_POINTS,
  DESCRIPTION_KEYWORD_POINTS,
  DESCRIPTION_KEYWORDS,
  FLOORS_THRESHOLDS,
  LEAD_TYPE_POINTS,
  PRIORITY_THRESHOLD_HOT,
  PRIORITY_THRESHOLD_WARM,
  RECENCY_THRESHOLDS,
  SCORE_MAX,
  SCORE_MIN,
  SQFT_THRESHOLDS,
  VALUE_THRESHOLDS,
} from "@/lib/scoring/constants";

type PriorityInput = Pick<
  PermitRecord,
  | "permit_issued_date"
  | "detail_description"
  | "estimated_value"
  | "lead_type"
  | "residential_commercial"
  | "square_footage"
  | "structure_floors"
>;

export function calculatePriority(input: PriorityInput) {
  const leadTypePoints = getLeadTypePoints(input.lead_type);
  const squareFootagePoints = getSquareFootagePoints(input.square_footage);
  const floorsPoints = getFloorsPoints(input.structure_floors);
  const valuePoints = getValuePoints(input.estimated_value);
  const commercialPoints = input.residential_commercial === "C" ? COMMERCIAL_POINTS : 0;
  const descriptionPoints = getDescriptionPoints(input.detail_description);
  const recencyPoints = getRecencyPoints(input.permit_issued_date);
  const score =
    leadTypePoints +
    squareFootagePoints +
    floorsPoints +
    valuePoints +
    commercialPoints +
    descriptionPoints +
    recencyPoints +
    0;

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
