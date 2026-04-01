import { parseEstimatedValue, parseInteger } from "@/lib/permits/value";
import { classifyLeadType } from "@/lib/permits/lead-type";

type ArcGisAttributes = {
  PermitIssuedDate?: string | null;
  ApplicationDate?: string | null;
  PermitNumber?: string | null;
  ProcessNumber?: string | null;
  MasterPermitNumber?: string | null;
  PermitType?: string | null;
  ResidentialCommercial?: string | null;
  EstimatedValue?: string | number | null;
  ApplicationTypeCode?: string | number | null;
  ApplicationTypeDescription?: string | null;
  ProposedUseCode?: string | number | null;
  ProposedUseDescription?: string | null;
  DetailDescriptionComments?: string | null;
  FolioNumber?: string | null;
  OwnerName?: string | null;
  LegalDescription1?: string | null;
  LegalDescription2?: string | null;
  PropertyAddress?: string | null;
  ArchitectName?: string | null;
  ContractorNumber?: string | null;
  ContractorName?: string | null;
  ContractorAddress?: string | null;
  ContractorCity?: string | null;
  ContractorState?: string | null;
  ContractorZip?: string | null;
  ContractorPhone?: string | null;
  SquareFootage?: string | number | null;
  StructureUnits?: string | number | null;
  StructureFloors?: string | number | null;
  PermitTotalFee?: string | null;
  LastInspectionDate?: string | null;
  LastApprovedInspDate?: string | null;
  CoCcDate?: string | null;
  City?: string | null;
  State?: string | null;
};

export type ArcGisFeature = {
  attributes: ArcGisAttributes;
};

export function parseIssuedDate(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
}

export function parseTimestamp(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function normalizePermit(feature: ArcGisFeature) {
  const attributes = feature.attributes;
  const permitNumber = attributes.PermitNumber?.trim();

  if (!permitNumber) {
    return null;
  }

  const detailDescription = attributes.DetailDescriptionComments?.trim() || null;

  return {
    permit_number: permitNumber,
    process_number: attributes.ProcessNumber?.trim() || null,
    master_permit_number: attributes.MasterPermitNumber?.trim() || null,
    folio_number: attributes.FolioNumber?.trim() || null,
    permit_type: attributes.PermitType?.trim() || null,
    application_type_code: parseInteger(attributes.ApplicationTypeCode),
    application_type_description: attributes.ApplicationTypeDescription?.trim() || null,
    proposed_use_code: parseInteger(attributes.ProposedUseCode),
    proposed_use_description: attributes.ProposedUseDescription?.trim() || null,
    detail_description: detailDescription,
    residential_commercial: attributes.ResidentialCommercial?.trim() || null,
    lead_type: classifyLeadType(
      attributes.ApplicationTypeDescription,
      detailDescription,
    ),
    permit_issued_date: parseIssuedDate(attributes.PermitIssuedDate),
    application_date: parseTimestamp(attributes.ApplicationDate),
    last_inspection_date: attributes.LastInspectionDate?.trim() || null,
    last_approved_insp_date: attributes.LastApprovedInspDate?.trim() || null,
    cocc_date: attributes.CoCcDate?.trim() || null,
    property_address: attributes.PropertyAddress?.trim() || null,
    legal_description_1: attributes.LegalDescription1?.trim() || null,
    legal_description_2: attributes.LegalDescription2?.trim() || null,
    city: attributes.City?.trim() || null,
    state: attributes.State?.trim() || null,
    estimated_value: parseEstimatedValue(attributes.EstimatedValue),
    permit_total_fee: attributes.PermitTotalFee?.trim() || null,
    square_footage: parseInteger(attributes.SquareFootage),
    structure_units: parseInteger(attributes.StructureUnits),
    structure_floors: parseInteger(attributes.StructureFloors),
    owner_name: attributes.OwnerName?.trim() || null,
    contractor_number: attributes.ContractorNumber?.trim() || null,
    contractor_name: attributes.ContractorName?.trim() || null,
    contractor_address: attributes.ContractorAddress?.trim() || null,
    contractor_city: attributes.ContractorCity?.trim() || null,
    contractor_state: attributes.ContractorState?.trim() || null,
    contractor_zip: attributes.ContractorZip?.trim() || null,
    contractor_phone: attributes.ContractorPhone?.trim() || null,
    architect_name: attributes.ArchitectName?.trim() || null,
    raw_data: attributes,
    updated_at: new Date().toISOString(),
  };
}
