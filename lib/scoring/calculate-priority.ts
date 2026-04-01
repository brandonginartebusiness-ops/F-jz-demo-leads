import { PermitRecord } from "@/lib/types";

type PriorityInput = Pick<
  PermitRecord,
  | "permit_issued_date"
  | "detail_description"
  | "estimated_value"
  | "residential_commercial"
  | "square_footage"
  | "structure_floors"
>;

export function calculatePriority(input: PriorityInput) {
  const squareFootagePoints = getSquareFootagePoints(input.square_footage);
  const floorsPoints = getFloorsPoints(input.structure_floors);
  const valuePoints = getValuePoints(input.estimated_value);
  const commercialPoints = input.residential_commercial === "C" ? 10 : 0;
  const descriptionPoints = getDescriptionPoints(input.detail_description);
  const recencyPoints = getRecencyPoints(input.permit_issued_date);
  const score =
    squareFootagePoints +
    floorsPoints +
    valuePoints +
    commercialPoints +
    descriptionPoints +
    recencyPoints +
    0;

  return {
    score: Math.min(score, 100),
    breakdown: {
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

function getSquareFootagePoints(squareFootage: number | null) {
  const value = squareFootage ?? 0;

  if (value > 10_000) {
    return 30;
  }

  if (value > 5_000) {
    return 20;
  }

  if (value > 1_000) {
    return 10;
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
    return 10;
  }

  if (value > 10_000) {
    return 5;
  }

  return 0;
}

function getDescriptionPoints(detailDescription: string | null) {
  const normalized = detailDescription?.trim().toUpperCase() ?? "";

  let score = 0;

  if (normalized.includes("TOTAL")) {
    score += 15;
  }

  if (normalized.includes("COMPLETE")) {
    score += 15;
  }

  return score;
}

function getRecencyPoints(permitIssuedDate: string | null) {
  if (!permitIssuedDate) {
    return 0;
  }

  const issued = new Date(permitIssuedDate);
  const diffInDays = Math.floor((Date.now() - issued.getTime()) / 86400000);

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
