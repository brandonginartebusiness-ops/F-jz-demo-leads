import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ActivityActionType, LeadStatus } from "@/lib/types";

const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "bookmarked",
  "contacted",
  "in_progress",
  "closed_won",
  "closed_lost",
];

type PermitUpdateBody = {
  lead_status?: string;
  notes?: string;
};

type ExistingPermitRow = {
  id: string;
  lead_status: LeadStatus;
  notes: string | null;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as PermitUpdateBody;
    const leadStatus = String(body.lead_status ?? "new") as LeadStatus;
    const notes = String(body.notes ?? "");

    if (!LEAD_STATUSES.includes(leadStatus)) {
      return NextResponse.json({ error: "Invalid lead status" }, { status: 400 });
    }

    const { data: currentPermit, error: permitError } = await admin
      .from("permits")
      .select("id, lead_status, notes")
      .eq("id", params.id)
      .single();

    if (permitError) {
      throw permitError;
    }

    const permit = currentPermit as ExistingPermitRow;

    const { error: updateError } = await admin
      .from("permits")
      .update({
        lead_status: leadStatus,
        notes,
      })
      .eq("id", params.id);

    if (updateError) {
      throw updateError;
    }

    const activityRows: Array<{
      permit_id: string;
      action_type: ActivityActionType;
      old_value: string | null;
      new_value: string | null;
      note: string | null;
    }> = [];

    if (permit.lead_status !== leadStatus) {
      activityRows.push({
        permit_id: permit.id,
        action_type: "status_change",
        old_value: permit.lead_status,
        new_value: leadStatus,
        note: null,
      });
    }

    if ((permit.notes ?? "") !== notes) {
      activityRows.push({
        permit_id: permit.id,
        action_type: "note_added",
        old_value: permit.notes,
        new_value: notes,
        note: notes || null,
      });
    }

    if (activityRows.length > 0) {
      const { error: activityError } = await admin.from("activity_feed").insert(activityRows);

      if (activityError) {
        throw activityError;
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/activity");
    revalidatePath("/dashboard/analytics");
    revalidatePath(`/dashboard/${params.id}`);

    return NextResponse.json({ id: permit.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update permit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
