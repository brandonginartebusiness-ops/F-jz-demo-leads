import { z } from "zod";

export const PROJECT_SIZE_OPTIONS = [
  "Under $500K",
  "$500K-$2M",
  "$2M-$10M",
  "$10M+",
] as const;

export const TONE_OPTIONS = [
  "Professional",
  "Direct",
  "Conversational",
  "Aggressive",
] as const;

export const companyContextSchema = z.object({
  company_name: z.string().trim().min(1, "Company name is required").max(120),
  offering: z.string().trim().min(1, "Offering is required").max(2000),
  service_areas: z.string().trim().min(1, "At least one service area is required"),
  target_market: z.string().trim().max(1000).optional().default(""),
  value_prop: z.string().trim().min(1, "Value proposition is required").max(2000),
  differentiators: z.string().trim().min(1, "Differentiators are required").max(2000),
  avg_project_size: z.enum(PROJECT_SIZE_OPTIONS, {
    errorMap: () => ({ message: "Select an average project size" }),
  }),
  tone: z.enum(TONE_OPTIONS, {
    errorMap: () => ({ message: "Select a tone" }),
  }),
});

export type CompanyContextPayload = z.infer<typeof companyContextSchema>;

export type CompanyContextRecord = CompanyContextPayload & {
  id: string;
  updated_at: string | null;
};

export function serviceAreasToArray(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean),
    ),
  );
}
