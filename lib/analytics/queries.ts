import { createClient } from "@/lib/supabase/server";
import { isMissingSchemaError } from "@/lib/supabase/errors";

type LeadStatusKey = "new" | "bookmarked" | "contacted" | "closed";
type PriorityKey = "Hot" | "Warm" | "Low";

type AnalyticsPermitRow = {
  address: string | null;
  estimated_value: number | null;
  issued_date: string | null;
  contractor_name: string | null;
  status: string | null;
  lead_status: string | null;
  residential_commercial: string | null;
  priority_label: string | null;
};

export type AnalyticsData = {
  topStats: {
    totalPermits: number;
    pipelineValue: number;
    newThisWeek: number;
    leadsContacted: number;
    activityThisWeek: number;
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
  priorityBreakdown: Array<{
    name: PriorityKey;
    value: number;
  }>;
};

const LEAD_STATUS_ORDER: LeadStatusKey[] = [
  "new",
  "bookmarked",
  "contacted",
  "closed",
] as const;

const PRIORITY_ORDER: PriorityKey[] = [
  "Hot",
  "Warm",
  "Low",
] as const;

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabase = createClient();
  let data: AnalyticsPermitRow[] | null = null;

  const primaryQuery = await supabase
    .from("permits")
    .select(
      "address, estimated_value, issued_date, contractor_name, status, lead_status, residential_commercial, priority_label",
    );

  if (primaryQuery.error) {
    if (isMissingSchemaError(primaryQuery.error)) {
      const fallbackQuery = await supabase
        .from("permits")
        .select(
          "address, estimated_value, issued_date, contractor_name, status, lead_status, residential_commercial",
        );

      if (fallbackQuery.error) {
        throw fallbackQuery.error;
      }

      data = (fallbackQuery.data ?? []).map((permit) => ({
        ...permit,
        priority_label: null,
      })) as AnalyticsPermitRow[];
    } else {
      throw primaryQuery.error;
    }
  } else {
    data = (primaryQuery.data ?? []) as AnalyticsPermitRow[];
  }
  const permits = data ?? [];
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const leadStatusCounts = new Map<LeadStatusKey, number>(
    LEAD_STATUS_ORDER.map((key) => [key, 0]),
  );
  const priorityCounts = new Map<PriorityKey, number>(
    PRIORITY_ORDER.map((key) => [key, 0]),
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

  const { count: activityThisWeek, error: activityError } = await supabase
    .from("activity_feed")
    .select("id", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo.toISOString());

  if (activityError && !isMissingSchemaError(activityError)) {
    throw activityError;
  }

  for (const permit of permits) {
    const estimatedValue = permit.estimated_value ?? 0;
    const issuedDate = permit.issued_date ? new Date(permit.issued_date) : null;
    const leadStatus = normalizeLeadStatus(permit.lead_status);
    const priority = normalizePriorityLabel(permit.priority_label) ?? classifyPriority(estimatedValue);
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

    priorityCounts.set(priority, (priorityCounts.get(priority) ?? 0) + 1);

    if (contractorName) {
      const current = contractorMap.get(contractorName) ?? {
        permitCount: 0,
        totalEstimatedValue: 0,
      };
      current.permitCount += 1;
      current.totalEstimatedValue += estimatedValue > 1 ? estimatedValue : 0;
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
      activityThisWeek: activityError ? 0 : (activityThisWeek ?? 0),
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
    priorityBreakdown: PRIORITY_ORDER.map((name) => ({
      name,
      value: priorityCounts.get(name) ?? 0,
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

function classifyPriority(estimatedValue: number): PriorityKey {
  if (estimatedValue >= 100_000) {
    return "Hot";
  }

  if (estimatedValue >= 25_000) {
    return "Warm";
  }

  return "Low";
}

function normalizePriorityLabel(value: string | null): PriorityKey | null {
  if (value === "Hot" || value === "Warm" || value === "Low") {
    return value;
  }

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

  const firstStreetWord = trimmed.match(/[A-Za-z][A-Za-z'-]*/);
  if (firstStreetWord) {
    return firstStreetWord[0].toUpperCase();
  }

  return "Other";
}
