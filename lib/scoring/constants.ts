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

// Recency points (days since permit issued).
// Research shows the outreach window is 0-7 days post-issue; leads go cold fast after 10 days.
export const RECENCY_THRESHOLDS = [
  { maxDays: 3, points: 25 },  // Peak window
  { maxDays: 7, points: 20 },  // Still prime
  { maxDays: 14, points: 8 },  // Fading
  { maxDays: 30, points: 3 },  // Stale
] as const;

// Open competitive slot: qualifier is not a demolition specialist.
// If the permit's contractor is a GC (or no contractor listed), the demo sub slot is likely open.
export const OPEN_SLOT_BONUS = 15;

// Keywords that indicate the contractor IS already a demolition specialist (slot taken).
export const DEMO_SPECIALIST_KEYWORDS = [
  "DEMO",
  "DEMOLITION",
  "WRECKING",
  "WRECK",
  "EXCAVAT",
  "ABATEMENT",
  "TEARDOWN",
  "TEAR DOWN",
  "DECONSTRUCT",
  "STRIP OUT",
] as const;

// Priority corridor bonus: Miami-Dade neighborhoods with highest active demo volume.
export const PRIORITY_CORRIDOR_BONUS = 8;
export const PRIORITY_CORRIDORS = [
  "EDGEWATER",
  "WYNWOOD",
  "BRICKELL",
  "DOWNTOWN",
  "OVERTOWN",
  "LITTLE RIVER",
  "ARTS",           // Arts & Entertainment District
  "MIDTOWN",
  "DORAL",
  "HIALEAH",
  "MIAMI BEACH",
  "CORAL GABLES",
] as const;

// ICP profile match bonus: permit matches an active Ideal Customer Profile.
export const ICP_MATCH_BONUS = 10;
