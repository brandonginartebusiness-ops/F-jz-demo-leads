import { createClient } from "@/lib/supabase/server";
import { PermitRecord } from "@/lib/types";

export type DashboardSearchParams = {
  leadStatus?: string;
  leadType?: string;
  showJunk?: string;
  priorityLabel?: string;
  dateFrom?: string;
  dateTo?: string;
  minValue?: string;
  maxValue?: string;
  minSqFt?: string;
  maxSqFt?: string;
  search?: string;
  sort?: string;
  view?: string;
};

export async function listPermits(searchParams: DashboardSearchParams) {
  const supabase = createClient();
  let query = supabase.from("permits").select("*");
  const normalizedSearch = normalizeSearchTerm(searchParams.search);
  const normalizedPriorityLabel = normalizePriorityLabel(searchParams.priorityLabel);

  if (searchParams.leadStatus) {
    query = query.eq("lead_status", searchParams.leadStatus);
  }

  if (searchParams.leadType) {
    query = query.eq("lead_type", searchParams.leadType);
  } else if (searchParams.showJunk !== "true") {
    query = query.neq("lead_type", "junk");
  }

  if (normalizedPriorityLabel) {
    if (normalizedPriorityLabel === "Hot") {
      query = query.gte("priority_score", 70);
    }

    if (normalizedPriorityLabel === "Warm") {
      query = query.gte("priority_score", 40).lt("priority_score", 70);
    }

    if (normalizedPriorityLabel === "Low") {
      query = query.lt("priority_score", 40);
    }
  }

  if (searchParams.dateFrom) {
    query = query.gte("permit_issued_date", searchParams.dateFrom);
  }

  if (searchParams.dateTo) {
    query = query.lte("permit_issued_date", searchParams.dateTo);
  }

  if (searchParams.minValue) {
    query = query.gte("estimated_value", Number(searchParams.minValue));
  }

  if (searchParams.maxValue) {
    query = query.lte("estimated_value", Number(searchParams.maxValue));
  }

  if (searchParams.minSqFt) {
    query = query.gte("square_footage", Number(searchParams.minSqFt));
  }

  if (searchParams.maxSqFt) {
    query = query.lte("square_footage", Number(searchParams.maxSqFt));
  }

  if (normalizedSearch) {
    query = query.or(
      [
        `property_address.ilike.%${normalizedSearch}%`,
        `contractor_name.ilike.%${normalizedSearch}%`,
        `owner_name.ilike.%${normalizedSearch}%`,
        `permit_number.ilike.%${normalizedSearch}%`,
        `detail_description.ilike.%${normalizedSearch}%`,
      ].join(","),
    );
  }

  switch (searchParams.sort) {
    case "priority_asc":
      query = query
        .order("priority_score", { ascending: true, nullsFirst: false })
        .order("permit_issued_date", { ascending: false, nullsFirst: false });
      break;
    case "value_desc":
      query = query
        .order("estimated_value", { ascending: false, nullsFirst: false })
        .order("priority_score", { ascending: false, nullsFirst: false })
        .order("permit_issued_date", { ascending: false, nullsFirst: false });
      break;
    case "value_asc":
      query = query
        .order("estimated_value", { ascending: true, nullsFirst: false })
        .order("priority_score", { ascending: false, nullsFirst: false })
        .order("permit_issued_date", { ascending: false, nullsFirst: false });
      break;
    case "sqft_desc":
      query = query
        .order("square_footage", { ascending: false, nullsFirst: false })
        .order("priority_score", { ascending: false, nullsFirst: false })
        .order("permit_issued_date", { ascending: false, nullsFirst: false });
      break;
    case "sqft_asc":
      query = query
        .order("square_footage", { ascending: true, nullsFirst: false })
        .order("priority_score", { ascending: false, nullsFirst: false })
        .order("permit_issued_date", { ascending: false, nullsFirst: false });
      break;
    case "date_asc":
      query = query
        .order("permit_issued_date", { ascending: true, nullsFirst: false })
        .order("priority_score", { ascending: false, nullsFirst: false });
      break;
    case "date_desc":
      query = query
        .order("permit_issued_date", { ascending: false, nullsFirst: false })
        .order("priority_score", { ascending: false, nullsFirst: false });
      break;
    case "priority_desc":
    default:
      query = query
        .order("priority_score", { ascending: false, nullsFirst: false })
        .order("permit_issued_date", { ascending: false, nullsFirst: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as PermitRecord[];
}
function normalizePriorityLabel(value?: string) {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "hot") {
    return "Hot";
  }

  if (normalized === "warm") {
    return "Warm";
  }

  if (normalized === "low") {
    return "Low";
  }

  return undefined;
}

function normalizeSearchTerm(value?: string) {
  if (!value) {
    return undefined;
  }

  const normalized = value
    .trim()
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ");

  return normalized.length > 0 ? normalized : undefined;
}

export async function getPermitById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("permits")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data as PermitRecord;
}
