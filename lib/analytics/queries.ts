import { createClient } from "@/lib/supabase/server";

type LeadStatusKey = "new" | "bookmarked" | "contacted" | "closed";
type PermitStatusKey = "Active" | "Finalized" | "Expired";

type AnalyticsPermitRow = {
  address: string | null;
  estimated_value: number | null;
  issued_date: string | null;
  contractor_name: string | null;
  status: string | null;
  lead_status: string | null;
  residential_commercial: string | null;
};

export type AnalyticsData = {
  topStats: {
    totalPermits: number;
    pipelineValue: number;
    newThisWeek: number;
    leadsContacted: number;
  };
  leadStatusBreakdown: Array<{
    name: LeadStatusKey;
    value: number;
  }>;
  permitsOverTime: Array<{
    month: string;
    permits: number;
  }>;
  topContractors: Array<{
    name: string;
    permitCount: number;
    totalEstimatedValue: number;
  }>;
  activeNeighborhoods: Array<{
    area: string;
    permitCount: number;
  }>;
  permitStatusBreakdown: Array<{
    name: PermitStatusKey;
    value: number;
  }>;
};

const LEAD_STATUS_ORDER: LeadStatusKey[] = [
  "new",
  "bookmarked",
  "contacted",
  "closed",
] as const;

const PERMIT_STATUS_ORDER: PermitStatusKey[] = [
  "Active",
  "Finalized",
  "Expired",
] as const;

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("permits")
    .select(
      "address, estimated_value, issued_date, contractor_name, status, lead_status, residential_commercial",
    );

  if (error) {
    throw error;
  }

  const permits = (data ?? []) as AnalyticsPermitRow[];
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const leadStatusCounts = new Map<LeadStatusKey, number>(
    LEAD_STATUS_ORDER.map((key) => [key, 0]),
  );
  const permitStatusCounts = new Map<PermitStatusKey, number>(
    PERMIT_STATUS_ORDER.map((key) => [key, 0]),
  );
  const contractorMap = new Map<
    string,
    {
      permitCount: number;
      totalEstimatedValue: number;
    }
  >();
  const areaMap = new Map<string, number>();
  const monthMap = buildLast12MonthsMap(now);

  let pipelineValue = 0;
  let newThisWeek = 0;
  let leadsContacted = 0;

  for (const permit of permits) {
    const estimatedValue = permit.estimated_value ?? 0;
    const issuedDate = permit.issued_date ? new Date(permit.issued_date) : null;
    const leadStatus = normalizeLeadStatus(permit.lead_status);
    const permitStatus = normalizePermitStatus(permit.status);
    const contractorName = normalizeContractorName(permit.contractor_name);
    const area = extractAreaLabel(permit.address);

    if (estimatedValue > 1) {
      pipelineValue += estimatedValue;
    }

    if (issuedDate && issuedDate >= sevenDaysAgo) {
      newThisWeek += 1;
    }

    if (leadStatus) {
      leadStatusCounts.set(leadStatus, (leadStatusCounts.get(leadStatus) ?? 0) + 1);

      if (leadStatus === "contacted" || leadStatus === "closed") {
        leadsContacted += 1;
      }
    }

    if (permitStatus) {
      permitStatusCounts.set(
        permitStatus,
        (permitStatusCounts.get(permitStatus) ?? 0) + 1,
      );
    }

    if (contractorName) {
      const current = contractorMap.get(contractorName) ?? {
        permitCount: 0,
        totalEstimatedValue: 0,
      };
      current.permitCount += 1;
      current.totalEstimatedValue += Math.max(estimatedValue, 0);
      contractorMap.set(contractorName, current);
    }

    areaMap.set(area, (areaMap.get(area) ?? 0) + 1);

    if (issuedDate) {
      const monthKey = formatMonthKey(issuedDate);
      if (monthMap.has(monthKey)) {
        monthMap.set(monthKey, (monthMap.get(monthKey) ?? 0) + 1);
      }
    }
  }

  return {
    topStats: {
      totalPermits: permits.length,
      pipelineValue,
      newThisWeek,
      leadsContacted,
    },
    leadStatusBreakdown: LEAD_STATUS_ORDER.map((name) => ({
      name,
      value: leadStatusCounts.get(name) ?? 0,
    })),
    permitsOverTime: Array.from(monthMap.entries()).map(([month, count]) => ({
      month,
      permits: count,
    })),
    topContractors: Array.from(contractorMap.entries())
      .map(([name, value]) => ({
        name,
        permitCount: value.permitCount,
        totalEstimatedValue: value.totalEstimatedValue,
      }))
      .sort(
        (left, right) =>
          right.permitCount - left.permitCount ||
          right.totalEstimatedValue - left.totalEstimatedValue,
      )
      .slice(0, 10),
    activeNeighborhoods: Array.from(areaMap.entries())
      .map(([area, permitCount]) => ({
        area,
        permitCount,
      }))
      .sort((left, right) => right.permitCount - left.permitCount)
      .slice(0, 10),
    permitStatusBreakdown: PERMIT_STATUS_ORDER.map((name) => ({
      name,
      value: permitStatusCounts.get(name) ?? 0,
    })),
  };
}

function buildLast12MonthsMap(now: Date) {
  const monthMap = new Map<string, number>();

  for (let offset = 11; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    monthMap.set(formatMonthKey(date), 0);
  }

  return monthMap;
}

function formatMonthKey(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

function normalizeLeadStatus(value: string | null): LeadStatusKey | null {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  return LEAD_STATUS_ORDER.includes(normalized as LeadStatusKey)
    ? (normalized as LeadStatusKey)
    : null;
}

function normalizePermitStatus(value: string | null): PermitStatusKey | null {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized.includes("active")) return "Active";
  if (normalized.includes("final")) return "Finalized";
  if (normalized.includes("expired")) return "Expired";

  return null;
}

function normalizeContractorName(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function extractAreaLabel(address: string | null) {
  const trimmed = address?.trim();

  if (!trimmed) {
    return "Unknown area";
  }

  const zipMatch = trimmed.match(/\b(\d{5})(?:-\d{4})?\b/);
  if (zipMatch) {
    return `ZIP ${zipMatch[1]}`;
  }

  const parts = trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    const city = parts[parts.length - 2];
    if (city && !/\d/.test(city)) {
      return city;
    }
  }

  const suffixMatch = trimmed.match(
    /\b(ave|avenue|st|street|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|pl|place|way|ter|terrace|trl|trail|pkwy|parkway)\b/i,
  );

  if (suffixMatch) {
    return `Street pattern: ${suffixMatch[0].toUpperCase()}`;
  }

  return "Other";
}
