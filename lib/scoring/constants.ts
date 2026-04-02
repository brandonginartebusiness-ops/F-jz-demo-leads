// Priority label score thresholds
export const PRIORITY_THRESHOLD_HOT = 70;
export const PRIORITY_THRESHOLD_WARM = 40;

// Score cap
export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

// Lead type points
export const LEAD_TYPE_POINTS = {
  full_demolition: 30,
  partial_demolition: 15,
  demo_related: 5,
  junk: -50,
  other: 0,
} as const;

// Square footage points
export const SQFT_THRESHOLDS = [
  { min: 10_000, points: 25 },
  { min: 5_000, points: 20 },
  { min: 1_000, points: 10 },
  { min: 1, points: 5 },
] as const;

// Floors points
export const FLOORS_THRESHOLDS = [
  { min: 3, points: 20 },
  { min: 2, points: 10 },
] as const;

// Estimated value points
export const VALUE_THRESHOLDS = [
  { min: 100_000, points: 25 },
  { min: 50_000, points: 15 },
  { min: 10_000, points: 10 },
  { min: 1_000, points: 5 },
] as const;

// Commercial premium points
export const COMMERCIAL_POINTS = 10;

// Description keyword points
export const DESCRIPTION_KEYWORDS = ["TOTAL", "COMPLETE", "FULL"] as const;
export const DESCRIPTION_KEYWORD_POINTS = 15;

// Recency points (days since permit issued)
export const RECENCY_THRESHOLDS = [
  { maxDays: 3, points: 20 },
  { maxDays: 7, points: 15 },
  { maxDays: 14, points: 10 },
  { maxDays: 30, points: 5 },
] as const;
