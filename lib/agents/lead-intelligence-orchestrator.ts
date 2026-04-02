import { createAdminClient } from "@/lib/supabase/admin";
import { PermitRecord } from "@/lib/types";
import { enrichPermitEcosystem } from "@/lib/agents/permit-enrichment-agent";
import { upsertGcProfile } from "@/lib/agents/gc-profiler-agent";
import { upsertPropertyOwner } from "@/lib/agents/developer-lookup-agent";
import { scoreAndUpdatePermit } from "@/lib/agents/close-probability-agent";

export type OrchestrationResult = {
  total: number;
  enriched: number;
  failed: number;
  skipped: number;
  errors: Array<{ permitId: string; agent: string; error: string }>;
  durationMs: number;
};

const DEFAULT_BATCH_SIZE = 10;

export async function enrichPermitBatch(
  permitIds?: string[],
  batchSize = DEFAULT_BATCH_SIZE,
): Promise<OrchestrationResult> {
  const startedAt = Date.now();
  const admin = createAdminClient();
  const errors: OrchestrationResult["errors"] = [];
  let enriched = 0;
  let failed = 0;
  const skipped = 0;

  // Fetch permits to process
  let permits: PermitRecord[];
  if (permitIds && permitIds.length > 0) {
    const { data, error } = await admin
      .from("permits")
      .select("*")
      .in("id", permitIds.slice(0, batchSize));
    if (error) throw error;
    permits = (data ?? []) as PermitRecord[];
  } else {
    // Get permits not yet enriched, prioritized by priority_score
    const { data, error } = await admin
      .from("permits")
      .select("*")
      .is("enriched_at", null)
      .order("priority_score", { ascending: false, nullsFirst: false })
      .limit(batchSize);
    if (error) throw error;
    permits = (data ?? []) as PermitRecord[];
  }

  if (permits.length === 0) {
    return { total: 0, enriched: 0, failed: 0, skipped: 0, errors: [], durationMs: Date.now() - startedAt };
  }

  // Process each permit through the agent pipeline
  for (const permit of permits) {
    try {
      // Agent 1: Permit Enrichment
      const ecosystemResult = await enrichPermitEcosystem(permit);
      if (ecosystemResult.error) {
        errors.push({ permitId: permit.id, agent: "permit-enrichment", error: ecosystemResult.error });
      }

      // Agent 2: GC Profiler
      if (permit.contractor_name) {
        try {
          await upsertGcProfile(permit.contractor_name);
        } catch (err) {
          errors.push({
            permitId: permit.id,
            agent: "gc-profiler",
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      // Agent 3: Developer Lookup
      if (permit.folio_number) {
        try {
          await upsertPropertyOwner(permit.folio_number, permit.owner_name);
        } catch (err) {
          errors.push({
            permitId: permit.id,
            agent: "developer-lookup",
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      // Agent 4: Close Probability (must run last — depends on agents 1-3)
      try {
        await scoreAndUpdatePermit(permit);
      } catch (err) {
        errors.push({
          permitId: permit.id,
          agent: "close-probability",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }

      enriched++;
    } catch (err) {
      failed++;
      errors.push({
        permitId: permit.id,
        agent: "orchestrator",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return {
    total: permits.length,
    enriched,
    failed,
    skipped,
    errors,
    durationMs: Date.now() - startedAt,
  };
}

export async function enrichSinglePermit(permitId: string): Promise<OrchestrationResult> {
  return enrichPermitBatch([permitId], 1);
}
