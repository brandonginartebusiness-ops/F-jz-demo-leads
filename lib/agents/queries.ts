import { createClient } from "@/lib/supabase/server";
import { isMissingSchemaError } from "@/lib/supabase/errors";

export type GcProfileRow = {
  id: string;
  contractor_name: string;
  total_jobs: number;
  demo_jobs: number;
  total_value: number;
  avg_value: number;
  first_seen: string | null;
  last_seen: string | null;
  top_addresses: Array<{ address: string; count: number }>;
  updated_at: string;
};

export type PropertyOwnerRow = {
  id: string;
  folio_number: string;
  owner_name: string | null;
  owner_type: string | null;
  mailing_address: string | null;
  assessed_value: number | null;
  land_use: string | null;
  research_notes: string | null;
  source: string | null;
  updated_at: string;
};

export type PermitEcosystemRow = {
  id: string;
  permit_id: string;
  related_permit_number: string;
  related_description: string | null;
  related_value: number | null;
  related_date: string | null;
  relationship_type: string;
  created_at: string;
};

export async function getPermitEcosystem(permitId: string): Promise<PermitEcosystemRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("permit_ecosystem")
    .select("*")
    .eq("permit_id", permitId)
    .order("related_date", { ascending: false });

  if (error) {
    if (isMissingSchemaError(error)) return [];
    throw error;
  }
  return (data ?? []) as PermitEcosystemRow[];
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

export async function getPropertyOwner(folioNumber: string): Promise<PropertyOwnerRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("property_owners")
    .select("*")
    .eq("folio_number", folioNumber)
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
    .order("demo_jobs", { ascending: false })
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
    .not("owner_type", "eq", "individual")
    .order("assessed_value", { ascending: false, nullsFirst: false })
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
    .select("permit_id, related_permit_number")
    .limit(500);

  if (error) {
    if (isMissingSchemaError(error)) return [];
    throw error;
  }

  // Count related permits per permit_id
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const id = row.permit_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  // Sort by count and take top N
  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (sorted.length === 0) return [];

  // Fetch permit details for these IDs
  const { data: permits, error: permitError } = await supabase
    .from("permits")
    .select("id, property_address, permit_number, estimated_value, contractor_name, close_probability")
    .in("id", sorted.map(([id]) => id));

  if (permitError) throw permitError;

  const permitMap = new Map((permits ?? []).map((p) => [p.id, p]));

  return sorted.map(([id, count]) => ({
    permitId: id,
    relatedCount: count,
    permit: permitMap.get(id) ?? null,
  }));
}
