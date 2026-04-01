import { PermitRecord } from "@/lib/types";

const BUSINESS_CONTRACTOR_KEYWORDS = ["INC", "CORP", "LLC", "GROUP", "CONSTRUCTION"];
const PREMIUM_LOCATIONS = [
  "BRICKELL",
  "MIAMI BEACH",
  "CORAL GABLES",
  "DOWNTOWN",
  "DORAL",
  "AVENTURA",
] as const;
const QUADRANT_LOCATIONS = [" NW ", " NE ", " SW ", " SE "] as const;

type PriorityLabel = "Hot" | "Warm" | "Low";

type PriorityInput = Pick<
  PermitRecord,
  "issued_date" | "contractor_name" | "status" | "address" | "estimated_value"
>;

export function calculatePriority(input: PriorityInput) {
  const recencyPoints = getRecencyPoints(input.issued_date);
  const contractorPoints = getContractorPoints(input.contractor_name);
  const permitStatusPoints = getPermitStatusPoints(input.status);
  const locationPoints = getLocationPoints(input.address);
  const valuePoints = getValuePoints(input.estimated_value);
  const score =
    recencyPoints +
    contractorPoints +
    permitStatusPoints +
    locationPoints +
    valuePoints;

  return {
    score,
    label: getPriorityLabel(score),
    breakdown: {
      recency: recencyPoints,
      contractor: contractorPoints,
      permitStatus: permitStatusPoints,
      location: locationPoints,
      value: valuePoints,
    },
  };
}

function getRecencyPoints(issuedDate: string | null) {
  if (!issuedDate) {
    return 0;
  }

  const issued = new Date(issuedDate);
  const diffInDays = Math.floor((Date.now() - issued.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays <= 7) {
    return 30;
  }

  if (diffInDays <= 30) {
    return 20;
  }

  if (diffInDays <= 90) {
    return 10;
  }

  return 0;
}

function getContractorPoints(contractorName: string | null) {
  const normalized = contractorName?.trim().toUpperCase();

  if (!normalized) {
    return 10;
  }

  if (BUSINESS_CONTRACTOR_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 25;
  }

  return 10;
}

function getPermitStatusPoints(status: string | null) {
  const normalized = status?.trim().toUpperCase();

  if (!normalized) {
    return 10;
  }

  if (
    normalized.includes("ACTIVE") ||
    normalized.includes("ISSUED") ||
    normalized.includes("OPEN") ||
    normalized.includes("PENDING")
  ) {
    return 20;
  }

  if (
    normalized.includes("FINAL") ||
    normalized.includes("FINALIZED") ||
    normalized.includes("COMPLETE") ||
    normalized.includes("COMPLETED") ||
    normalized.includes("CLOSED")
  ) {
    return 10;
  }

  if (normalized.includes("EXPIRED")) {
    return 0;
  }

  return 10;
}

function getLocationPoints(address: string | null) {
  const normalized = ` ${address?.trim().toUpperCase() ?? ""} `;

  if (!normalized.trim()) {
    return 5;
  }

  if (PREMIUM_LOCATIONS.some((location) => normalized.includes(location))) {
    return 15;
  }

  if (QUADRANT_LOCATIONS.some((quadrant) => normalized.includes(quadrant))) {
    return 8;
  }

  return 5;
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

function getPriorityLabel(score: number): PriorityLabel {
  if (score >= 70) {
    return "Hot";
  }

  if (score >= 40) {
    return "Warm";
  }

  return "Low";
}
