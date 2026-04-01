---
name: analytics-dashboard
description: Add or update the JZ Demolition analytics dashboard with `app/dashboard/analytics/page.tsx`, `app/api/analytics/route.ts`, Recharts visualizations, and the existing dashboard nav link. Use when the user asks for analytics, KPI cards, permit trends, lead status charts, contractor rankings, active areas, or the analytics page in this app.
---

# Analytics Dashboard

Use this skill when implementing or updating analytics in this repository.

## Goal

Build a focused analytics screen without broad dashboard refactors.

Default scope:

1. Keep the entry page at `app/dashboard/analytics/page.tsx`.
2. Use a single `GET /api/analytics` endpoint as the analytics payload source.
3. Reuse `recharts` for charts.
4. Only touch the existing nav to add or preserve the `Analytics` link.

## Repo Anchors

Follow these existing patterns unless the user says otherwise:

- Authenticated server pages: `app/dashboard/page.tsx`, `app/dashboard/setup/page.tsx`
- Dashboard nav: `components/dashboard/nav.tsx`
- Existing chart styling: `components/dashboard/analytics-charts.tsx`
- Supabase server access: `lib/supabase/server.ts`
- Permit reads: `lib/permits/queries.ts`
- API route style: `app/api/export/route.ts`, `app/api/leads/icp/route.ts`

## Required Output

Implement these sections:

1. Four stat cards:
   - Total Permits
   - Pipeline Value
   - New This Week
   - Leads Contacted
2. Permits Over Time line chart for the last 12 months
3. Leads By Status donut chart
4. Priority Breakdown badges for Hot, Warm, Low
5. Top Contractors table with contractor name, permit count, total value
6. Most Active Areas table grouped by the first street-word area label

## Data Rules

Use these defaults unless the repository already has a stronger existing rule:

- `Pipeline Value`: sum `estimated_value` where the value is greater than `1`
- `New This Week`: `issued_date` within the last 7 days
- `Leads Contacted`: `lead_status` in `contacted`, `closed`
- `Leads By Status`: `new`, `bookmarked`, `contacted`, `closed`
- `Permits Over Time`: last 12 months, grouped by month label
- `Most Active Areas`: group by the first alphabetic word in `address`; ignore leading street numbers

If the repo does not already store explicit lead priority, derive it consistently in code and document the heuristic in the final response.

Recommended fallback heuristic:

- `Hot`: estimated value >= 100000
- `Warm`: estimated value >= 25000 and < 100000
- `Low`: everything else

## UI Constraints

- Keep the existing dark dashboard styling language.
- Use `#FF6B00` as the primary analytics accent.
- Use `#888888` as the secondary neutral.
- Prefer adding a new local client component for API-driven interactivity instead of overloading the page file.
- Do not restyle unrelated dashboard pages.

## Implementation Workflow

Use this checklist:

```text
Task Progress:
- [ ] Inspect existing analytics page, API route, and nav
- [ ] Confirm `recharts` is present before adding it
- [ ] Create or update `app/api/analytics/route.ts`
- [ ] Implement analytics aggregation in `lib/analytics/queries.ts`
- [ ] Build the dashboard UI in `app/dashboard/analytics/page.tsx` plus local components as needed
- [ ] Ensure the nav includes `Analytics`
- [ ] Verify lint for touched files
```

## API Guidance

For `GET /api/analytics`:

- Verify the user is authenticated
- Return all dashboard stats in one payload
- Prefer a direct JSON payload over multiple nested wrappers unless the repo already standardizes on a wrapper
- Return `401` for anonymous users
- Return `500` with a helpful message on unexpected failures

## Page Guidance

Preferred structure:

1. Server page checks auth and renders the dashboard shell
2. Client component fetches `/api/analytics`
3. Charts and tables render from that single response

If server-side loading is simpler for the current request, keep the route as the canonical analytics contract even if the page also reads the same query helper directly.

## Verification

After implementation, validate at least these:

1. `/dashboard/analytics` redirects unauthenticated users to login
2. `GET /api/analytics` returns all sections in one response for authenticated users
3. The dashboard renders all six requested sections
4. The active-area grouping follows the first street-word rule
5. Touched files are lint-clean

## Output Style

When finishing:

- Summarize the analytics sections that were added or updated
- Call out any assumptions, especially for derived priority logic
- Mention whether `recharts` was already installed or had to be added
