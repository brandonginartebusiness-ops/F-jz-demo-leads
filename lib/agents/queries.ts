import { createClient } from "@/lib/supabase/server";
import { isMissingSchemaError } from "@/lib/supabase/errors";

export type GcProfileRow = {
  id: string;
  contractor_name: string;
  total_permits_12mo: number;
  active_permits_90d: number;
  avg_project_value: number;
  primary_trades: string[];
  geo_focus: string[];
  demo_frequency: number;
  updated_at: string;
};

export type PropertyOwnerRow = {
  id: string;
  folio: string;
  owner_name: string | null;
  owner_type: string | null;
  mailing_address: string | null;
  company_research: unknown;
  updated_at: string;
};

export type PermitEcosystemRow = {
  id: string;
  permit_id: string;
  folio: string | null;
  related_permit_count: number;
  trade_types: string[];
  sub_contractors: string[];
  primary_gc: string | null;
  activity_score: number;
  updated_at: string;
};

export async function getPermitEcosystem(permitId: string): Promise<PermitEcosystemRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("permit_ecosystem")
    .select("*")
    .eq("permit_id", permitId)
    .single();

  if (error) {
    if (isMissingSchemaError(error)) return null;
    return null;
  }
  return data as PermitEcosystemRow | null;
}

export async function getGcProfile(contractorName: string): Promise<GcProfileRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gc_profiles")
    .select("*")
    .eq("contractor_name", contractorName)
    .single();

  if (error) {
    if (isMissingSchemaError(error)) return null;
    return null;
  }
  return data as GcProfileRow | null;
}

export async function getPropertyOwner(folio: string): Promise<PropertyOwnerRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("property_owners")
    .select("*")
    .eq("folio", folio)
    .single();

  if (error) {
    if (isMissingSchemaError(error)) return null;
    return null;
  }
  return data as PropertyOwnerRow | null;
}

export async function listTopGcs(limit = 20): Promise<GcProfileRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gc_profiles")
    .select("*")
    .order("active_permits_90d", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingSchemaError(error)) return [];
    throw error;
  }
  return (data ?? []) as GcProfileRow[];
}

export async function listPropertyOwners(limit = 20): Promise<PropertyOwnerRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("property_owners")
    .select("*")
    .eq("owner_type", "corporate")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingSchemaError(error)) return [];
    throw error;
  }
  return (data ?? []) as PropertyOwnerRow[];
}

export async function listMostActiveProperties(limit = 20) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("permit_ecosystem")
    .select("permit_id, related_permit_count, folio")
    .order("related_permit_count", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingSchemaError(error)) return [];
    throw error;
  }

  if (!data || data.length === 0) return [];

  const permitIds = data.map((d) => d.permit_id as string);
  const { data: permits, error: permitError } = await supabase
    .from("permits")
    .select("id, property_address, permit_number, estimated_value, contractor_name, owner_name, close_probability_score, close_probability_label")
    .in("id", permitIds);

  if (permitError) throw permitError;

  const permitMap = new Map((permits ?? []).map((p) => [p.id, p]));

  return data.map((eco) => ({
    permitId: eco.permit_id as string,
    relatedCount: eco.related_permit_count as number,
    folio: eco.folio as string | null,
    permit: permitMap.get(eco.permit_id as string) ?? null,
  }));
}
