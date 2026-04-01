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
      return "bg-[#22c55e]/15 text-[#86efac]";
    case "partial_demolition":
      return "bg-[#facc15]/15 text-[#fde68a]";
    case "demo_related":
      return "bg-[#888888]/15 text-[#C0C0C0]";
    case "junk":
      return "bg-[#ef4444]/15 text-[#fca5a5]";
    default:
      return "bg-[#525252]/15 text-[#C0C0C0]";
  }
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

function matchesAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}
