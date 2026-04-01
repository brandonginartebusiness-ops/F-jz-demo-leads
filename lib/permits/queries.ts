import { createClient } from "@/lib/supabase/server";
import { isMissingSchemaError } from "@/lib/supabase/errors";
import { PermitRecord } from "@/lib/types";

export type DashboardSearchParams = {
  leadStatus?: string;
  priorityLabel?: string;
  dateFrom?: string;
  dateTo?: string;
  minValue?: string;
  maxValue?: string;
  search?: string;
  sort?: string;
  view?: string;
};

export async function listPermits(searchParams: DashboardSearchParams) {
  const supabase = createClient();
  try {
    const { data, error } = await buildPermitsQuery(supabase, searchParams, true);

    if (error) {
      throw error;
    }

    return (data ?? []) as PermitRecord[];
  } catch (error) {
    if (
      isMissingSchemaError(error) &&
      (!searchParams.priorityLabel ||
        searchParams.priorityLabel === "Hot" ||
        searchParams.priorityLabel === "Warm" ||
        searchParams.priorityLabel === "Low")
    ) {
      const { data, error: fallbackError } = await buildPermitsQuery(
        supabase,
        { ...searchParams, priorityLabel: undefined, sort: normalizeLegacySort(searchParams.sort) },
        false,
      );

      if (fallbackError) {
        throw fallbackError;
      }

      return (data ?? []) as PermitRecord[];
    }

    throw error;
  }
}

function buildPermitsQuery(
  supabase: ReturnType<typeof createClient>,
  searchParams: DashboardSearchParams,
  includePriority: boolean,
) {
  let query = supabase.from("permits").select("*");

  if (includePriority) {
    query = query.order("priority_score", { ascending: false, nullsFirst: false });
  }

  query = query.order("issued_date", { ascending: false, nullsFirst: false });

  if (searchParams.leadStatus) {
    query = query.eq("lead_status", searchParams.leadStatus);
  }

  if (includePriority && searchParams.priorityLabel) {
    query = query.eq("priority_label", searchParams.priorityLabel);
  }

  if (searchParams.dateFrom) {
    query = query.gte("issued_date", new Date(searchParams.dateFrom).toISOString());
  }

  if (searchParams.dateTo) {
    query = query.lte("issued_date", new Date(searchParams.dateTo).toISOString());
  }

  if (searchParams.minValue) {
    query = query.gte("estimated_value", Number(searchParams.minValue));
  }

  if (searchParams.maxValue) {
    query = query.lte("estimated_value", Number(searchParams.maxValue));
  }

  if (searchParams.search) {
    const search = searchParams.search.trim();
    query = query.or(`address.ilike.%${search}%,contractor_name.ilike.%${search}%`);
  }

  if (includePriority && (!searchParams.sort || searchParams.sort === "priority_desc")) {
    query = query.order("priority_score", { ascending: false, nullsFirst: false });
  }

  if (includePriority && searchParams.sort === "priority_asc") {
    query = query.order("priority_score", { ascending: true, nullsFirst: false });
  }

  if (searchParams.sort === "value_desc") {
    query = query.order("estimated_value", { ascending: false, nullsFirst: false });
  }

  if (searchParams.sort === "value_asc") {
    query = query.order("estimated_value", { ascending: true, nullsFirst: false });
  }

  if (searchParams.sort === "date_asc") {
    query = query.order("issued_date", { ascending: true, nullsFirst: false });
  }

  if (searchParams.sort === "date_desc") {
    query = query.order("issued_date", { ascending: false, nullsFirst: false });
  }

  return query;
}

function normalizeLegacySort(sort?: string) {
  if (!sort || sort === "priority_desc" || sort === "priority_asc") {
    return "date_desc";
  }

  return sort;
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
