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
  let query = supabase.from("permits").select("*").order("issued_date", {
    ascending: false,
  });

  if (searchParams.leadStatus) {
    query = query.eq("lead_status", searchParams.leadStatus);
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
    query = query.or(
      `address.ilike.%${search}%,contractor_name.ilike.%${search}%`,
    );
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
