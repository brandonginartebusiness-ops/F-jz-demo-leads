import { createClient } from "@/lib/supabase/server";
import { ActivityActionType, ActivityFeedRecord } from "@/lib/types";

type ActivityFeedRow = {
  id: string;
  permit_id: string | null;
  action_type: ActivityActionType | null;
  old_value: string | null;
  new_value: string | null;
  note: string | null;
  created_at: string | null;
  permit: {
    address: string | null;
  } | null;
};

export async function listActivityFeed(actionType?: ActivityActionType) {
  const supabase = createClient();
  let query = supabase
    .from("activity_feed")
    .select(
      "id, permit_id, action_type, old_value, new_value, note, created_at, permit:permits(address)",
    )
    .order("created_at", { ascending: false });

  if (actionType) {
    query = query.eq("action_type", actionType);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return mapActivityRows(data ?? []);
}

export async function listPermitActivity(permitId: string, limit = 5) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("activity_feed")
    .select(
      "id, permit_id, action_type, old_value, new_value, note, created_at, permit:permits(address)",
    )
    .eq("permit_id", permitId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return mapActivityRows(data ?? []);
}

export async function countActivityThisWeek() {
  const supabase = createClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count, error } = await supabase
    .from("activity_feed")
    .select("id", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo.toISOString());

  if (error) {
    throw error;
  }

  return count ?? 0;
}

function mapActivityRows(rows: ActivityFeedRow[]): ActivityFeedRecord[] {
  return rows.map((row) => ({
    id: row.id,
    permit_id: row.permit_id,
    action_type: row.action_type,
    old_value: row.old_value,
    new_value: row.new_value,
    note: row.note,
    created_at: row.created_at,
    permit_address: row.permit?.address ?? null,
  }));
}
