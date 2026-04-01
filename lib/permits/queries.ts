import { createClient } from "@/lib/supabase/server";
import { PermitRecord } from "@/lib/types";

export type DashboardSearchParams = {
  leadStatus?: string;
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
  let query = supabase
    .from("permits")
    .select("*")
    .order("priority_score", { ascending: false, nullsFirst: false })
    .order("permit_issued_date", { ascending: false, nullsFirst: false });

  if (searchParams.leadStatus) {
    query = query.eq("lead_status", searchParams.leadStatus);
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

  if (searchParams.search) {
    const search = searchParams.search.trim();
    query = query.or(
      [
        `property_address.ilike.%${search}%`,
        `contractor_name.ilike.%${search}%`,
        `owner_name.ilike.%${search}%`,
        `permit_number.ilike.%${search}%`,
        `detail_description.ilike.%${search}%`,
      ].join(","),
    );
  }

  if (!searchParams.sort || searchParams.sort === "priority_desc") {
    query = query.order("priority_score", { ascending: false, nullsFirst: false });
  }

  if (searchParams.sort === "priority_asc") {
    query = query.order("priority_score", { ascending: true, nullsFirst: false });
  }

  if (searchParams.sort === "value_desc") {
    query = query.order("estimated_value", { ascending: false, nullsFirst: false });
  }

  if (searchParams.sort === "value_asc") {
    query = query.order("estimated_value", { ascending: true, nullsFirst: false });
  }

  if (searchParams.sort === "date_asc") {
    query = query.order("permit_issued_date", { ascending: true, nullsFirst: false });
  }

  if (searchParams.sort === "date_desc") {
    query = query.order("permit_issued_date", { ascending: false, nullsFirst: false });
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as PermitRecord[];
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
