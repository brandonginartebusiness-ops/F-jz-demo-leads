import { LeadType } from "@/lib/permits/lead-type";

export type LeadStatus =
  | "new"
  | "bookmarked"
  | "contacted"
  | "in_progress"
  | "closed_won"
  | "closed_lost";
export type ActivityActionType = "status_change" | "note_added" | "permit_synced";

export type PermitRecord = {
  id: string;
  permit_number: string;
  process_number: string | null;
  master_permit_number: string | null;
  folio_number: string | null;
  permit_type: string | null;
  application_type_code: number | null;
  application_type_description: string | null;
  proposed_use_code: number | null;
  proposed_use_description: string | null;
  detail_description: string | null;
  residential_commercial: string | null;
  lead_type: LeadType;
  permit_issued_date: string | null;
  application_date: string | null;
  last_inspection_date: string | null;
  last_approved_insp_date: string | null;
  cocc_date: string | null;
  property_address: string | null;
  legal_description_1: string | null;
  legal_description_2: string | null;
  city: string | null;
  state: string | null;
  estimated_value: number | null;
  permit_total_fee: string | null;
  square_footage: number | null;
  structure_units: number | null;
  structure_floors: number | null;
  owner_name: string | null;
  contractor_number: string | null;
  contractor_name: string | null;
  contractor_address: string | null;
  contractor_city: string | null;
  contractor_state: string | null;
  contractor_zip: string | null;
  contractor_phone: string | null;
  architect_name: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
  lead_status: LeadStatus;
  notes: string | null;
  priority_score: number | null;
  close_probability_score: number | null;
  close_probability_label: string | null;
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
