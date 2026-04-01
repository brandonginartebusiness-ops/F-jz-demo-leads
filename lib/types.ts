export type LeadStatus = "new" | "bookmarked" | "contacted" | "closed";
export type ActivityActionType = "status_change" | "note_added" | "permit_synced";

export type PermitRecord = {
  id: string;
  folio: string | null;
  address: string | null;
  standardized_address: string | null;
  description: string | null;
  estimated_value: number | null;
  issued_date: string | null;
  contractor_name: string | null;
  status: string | null;
  residential_commercial: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string | null;
  lead_status: LeadStatus;
  notes: string | null;
};

export type PermitUpdate = Pick<PermitRecord, "lead_status" | "notes">;

export type ActivityFeedRecord = {
  id: string;
  permit_id: string | null;
  action_type: ActivityActionType | null;
  old_value: string | null;
  new_value: string | null;
  note: string | null;
  created_at: string | null;
  permit_address: string | null;
};
