export function parseEstimatedValue(raw: unknown) {
  if (raw === null || raw === undefined) {
    return 0;
  }

  if (typeof raw === "number") {
    return Number.isFinite(raw) ? Math.trunc(raw) : 0;
  }

  const parsed = Number.parseInt(String(raw), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatEstimatedValue(value: number | null | undefined) {
  const normalized = typeof value === "number" ? value : 0;

  if (!normalized || normalized <= 1) {
    return "Not disclosed";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(normalized);
}
