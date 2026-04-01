import { z } from "zod";

export const INDUSTRY_PRESETS = [
  "Commercial Real Estate",
  "Healthcare",
  "Hospitality",
  "Government",
  "Industrial",
  "Retail",
] as const;

export const JOB_TITLE_PRESETS = [
  "VP of Construction",
  "Facilities Director",
  "Project Manager",
  "Director of Real Estate",
  "Property Manager",
] as const;

export const DEFAULT_LOCATION = "Miami, FL";

const tagArraySchema = z
  .array(z.string().trim().min(1).max(120))
  .max(25)
  .optional()
  .default([]);

const nullableIntSchema = z
  .union([z.number().int().nonnegative(), z.null(), z.undefined()])
  .transform((value) => value ?? null);

export const icpProfileSchema = z
  .object({
    name: z.string().trim().min(1, "Profile name is required").max(120),
    industries: tagArraySchema,
    company_size_min: nullableIntSchema,
    company_size_max: nullableIntSchema,
    job_titles: tagArraySchema,
    locations: tagArraySchema,
  })
  .superRefine((value, ctx) => {
    if (
      value.company_size_min !== null &&
      value.company_size_max !== null &&
      value.company_size_min > value.company_size_max
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Minimum company size cannot exceed maximum company size",
        path: ["company_size_min"],
      });
    }
  })
  .transform((value) => ({
    ...value,
    industries: uniqueTrimmed(value.industries),
    job_titles: uniqueTrimmed(value.job_titles),
    locations: withDefaultLocation(uniqueTrimmed(value.locations)),
  }));

export type IcpProfileInput = z.input<typeof icpProfileSchema>;
export type IcpProfilePayload = z.output<typeof icpProfileSchema>;

export type IcpProfileRecord = {
  id: string;
  name: string;
  industries: string[] | null;
  company_size_min: number | null;
  company_size_max: number | null;
  job_titles: string[] | null;
  locations: string[] | null;
  is_active: boolean;
  created_at: string;
};

function uniqueTrimmed(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
}

function withDefaultLocation(values: string[]) {
  return values.length > 0 ? values : [DEFAULT_LOCATION];
}
