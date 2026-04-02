export const LEAD_TYPES = [
  "unknown",
  "full_demolition",
  "partial_demolition",
  "demo_related",
  "junk",
] as const;

export type LeadType = (typeof LEAD_TYPES)[number];

const FULL_DEMOLITION_KEYWORDS = [
  "TOTAL DEMO",
  "COMPLETE DEMO",
  "FULL DEMO",
  "DEMO OF",
  "DEMOLITION",
  "DEMO OF STRUCTURE",
];

const PARTIAL_DEMOLITION_KEYWORDS = [
  "INTERIOR DEMO",
  "PARTIAL DEMO",
  "INT DEMO",
  "DEMO INTERIOR",
  "DEMO EXISTING",
];

const JUNK_KEYWORDS = [
  "SCREEN",
  "FAUCET",
  "OUTLET",
  "FIXTURE",
  "FENCE",
  "SIGN",
  "AWNING",
  "RAILING",
];

export function classifyLeadType(
  applicationTypeDescription: string | null | undefined,
  detailDescription: string | null | undefined,
): LeadType {
  const type = normalize(applicationTypeDescription);
  const description = normalize(detailDescription);

  if (type.includes("DEMOL")) {
    return "full_demolition";
  }

  if (matchesAny(description, FULL_DEMOLITION_KEYWORDS)) {
    return "full_demolition";
  }

  if (matchesAny(description, PARTIAL_DEMOLITION_KEYWORDS)) {
    return "partial_demolition";
  }

  if (matchesAny(description, JUNK_KEYWORDS)) {
    return "junk";
  }

  if (description.includes("DEMO")) {
    return "demo_related";
  }

  return "unknown";
}

export function getLeadTypeLabel(leadType: LeadType | string | null | undefined) {
  switch (leadType) {
    case "full_demolition":
      return "Full Demo";
    case "partial_demolition":
      return "Partial Demo";
    case "demo_related":
      return "Demo Related";
    case "junk":
      return "Junk";
    default:
      return "Unknown";
  }
}

export function getLeadTypeStyles(leadType: LeadType | string | null | undefined) {
  switch (leadType) {
    case "full_demolition":
      return "bg-teal/15 text-teal border-teal/30";
    case "partial_demolition":
      return "bg-amber/15 text-amber border-amber/30";
    case "demo_related":
      return "bg-bg-soft text-sand border-stroke";
    case "junk":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-bg-soft text-sand border-stroke";
  }
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

function matchesAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}
