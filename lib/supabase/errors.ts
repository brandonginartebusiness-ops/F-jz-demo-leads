type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

const MISSING_SCHEMA_CODES = new Set(["42703", "42P01", "PGRST204", "PGRST205"]);

export function isMissingSchemaError(error: unknown) {
  const candidate = error as SupabaseLikeError | null;
  const message = `${candidate?.message ?? ""} ${candidate?.details ?? ""} ${candidate?.hint ?? ""}`
    .toLowerCase()
    .trim();

  if (candidate?.code && MISSING_SCHEMA_CODES.has(candidate.code)) {
    return true;
  }

  return (
    message.includes("column") ||
    message.includes("table") ||
    message.includes("relationship") ||
    message.includes("schema cache") ||
    message.includes("could not find") ||
    message.includes("does not exist")
  );
}
