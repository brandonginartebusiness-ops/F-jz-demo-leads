import { PermitRecord } from "@/lib/types";

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
  const commercialPoints = input.residential_commercial === "C" ? 10 : 0;
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
    score: Math.max(0, Math.min(score, 100)),
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
  if (score >= 70) {
    return "Hot";
  }

  if (score >= 40) {
    return "Warm";
  }

  return "Low";
}

function getLeadTypePoints(leadType: PermitRecord["lead_type"]) {
  if (leadType === "full_demolition") {
    return 30;
  }

  if (leadType === "partial_demolition") {
    return 15;
  }

  if (leadType === "demo_related") {
    return 5;
  }

  if (leadType === "junk") {
    return -50;
  }

  return 0;
}

function getSquareFootagePoints(squareFootage: number | null) {
  const value = squareFootage ?? 0;

  if (value > 10_000) {
    return 25;
  }

  if (value > 5_000) {
    return 20;
  }

  if (value > 1_000) {
    return 10;
  }

  if (value > 0) {
    return 5;
  }

  return 0;
}

function getFloorsPoints(structureFloors: number | null) {
  const value = structureFloors ?? 0;
  if (value >= 3) {
    return 20;
  }

  if (value >= 2) {
    return 10;
  }

  return 0;
}

function getValuePoints(estimatedValue: number | null) {
  const value = estimatedValue ?? 0;

  if (value > 100_000) {
    return 25;
  }

  if (value > 50_000) {
    return 15;
  }

  if (value > 10_000) {
    return 10;
  }

  if (value > 1_000) {
    return 5;
  }

  return 0;
}

function getDescriptionPoints(detailDescription: string | null) {
  const normalized = detailDescription?.trim().toUpperCase() ?? "";

  if (
    normalized.includes("TOTAL") ||
    normalized.includes("COMPLETE") ||
    normalized.includes("FULL")
  ) {
    return 15;
  }

  return 0;
}

function getRecencyPoints(permitIssuedDate: string | null) {
  if (!permitIssuedDate) {
    return 0;
  }

  const issued = new Date(permitIssuedDate);
  const diffInDays = Math.floor((Date.now() - issued.getTime()) / 86400000);

  if (diffInDays <= 3) {
    return 20;
  }

  if (diffInDays <= 7) {
    return 15;
  }

  if (diffInDays <= 14) {
    return 10;
  }

  if (diffInDays <= 30) {
    return 5;
  }

  return 0;
}
