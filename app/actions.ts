"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { type LeadStatus } from "@/lib/types";

const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "bookmarked",
  "contacted",
  "in_progress",
  "closed_won",
  "closed_lost",
];

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updatePermit(formData: FormData) {
  const supabase = createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const id = String(formData.get("id") ?? "");
  const leadStatus = String(formData.get("lead_status") ?? "new") as LeadStatus;
  const notes = String(formData.get("notes") ?? "");

  if (!LEAD_STATUSES.includes(leadStatus)) {
    throw new Error("Invalid lead status");
  }

  const { error } = await admin
    .from("permits")
    .update({
      lead_status: leadStatus,
      notes,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
}
