---
name: priority-scoring
description: Add or update JZ Demolition permit priority scoring with `priority_score` and `priority_label`, a shared scoring helper, a bulk scoring API route, cron integration, and dashboard priority filters and badges. Use when the user asks for lead scoring, priority ranking, Hot/Warm/Low labels, permit prioritization, or priority-based dashboard sorting in this app.
---

# Priority Scoring

Use this skill when implementing or updating permit priority scoring in this repository.

## Goal

Add a lightweight scoring system that ranks permits out of 100 and makes priority visible in the main dashboard.

Default scope:

1. Store `priority_score` and `priority_label` on `permits`.
2. Calculate scores in `lib/scoring/calculate-priority.ts`.
3. Expose a bulk scorer at `POST /api/permits/score`.
4. Re-run scoring after permit syncs.
5. Surface priority badges, filters, and default sorting on the dashboard.

## Repo Anchors

Follow these patterns unless the user says otherwise:

- Permit reads: `lib/permits/queries.ts`
- Dashboard filters and list UI: `components/dashboard/filters.tsx`, `components/dashboard/permits-table.tsx`, `components/dashboard/permits-cards.tsx`
- Cron sync flow: `app/api/cron/sync-permits/route.ts`
- Shared types: `lib/types.ts`
- Supabase admin writes: `lib/supabase/admin.ts`

## Required Output

Implement these parts:

1. A migration that adds `priority_score` and `priority_label`
2. A shared scoring helper with deterministic rules
3. A bulk scoring updater and `POST /api/permits/score`
4. Cron integration so scoring runs after sync
5. Dashboard priority filter, default priority sort, and colored Hot/Warm/Low badges
6. A one-time backfill for existing permits

## Scoring Rules

Use these exact score bands:

- Recency: 30 / 20 / 10 / 0
- Contractor: 25 for business-style names containing `INC`, `CORP`, `LLC`, `GROUP`, or `CONSTRUCTION`; otherwise 10
- Permit status: 20 active, 10 finalized, 0 expired
- Location: 15 premium location match, 8 quadrant match, 5 other
- Value: 10 above 100000, 5 above 10000, 0 for 1 or 0

Labels:

- `Hot`: 70 to 100
- `Warm`: 40 to 69
- `Low`: 0 to 39

## UI Constraints

- Keep the existing dark dashboard styling.
- Use these badge colors:
  - `Hot`: `#FF6B00`
  - `Warm`: `#FFB347`
  - `Low`: `#888888`
- Make priority the default dashboard sort order unless the user picks another sort.

## Implementation Workflow

Use this checklist:

```text
Task Progress:
- [ ] Inspect permit query, filters, cards, table, and cron sync flow
- [ ] Add the priority columns migration
- [ ] Add shared types and the scoring helper
- [ ] Add a reusable bulk scoring updater and scoring API route
- [ ] Call scoring at the end of permit sync
- [ ] Update dashboard filtering, sorting, and badges
- [ ] Run a one-time backfill for existing permits
- [ ] Verify touched files are lint-clean
```

## Verification

After implementation, validate at least these:

1. New and existing permits have `priority_score` and `priority_label`
2. `POST /api/permits/score` updates all permits and returns the updated count
3. Cron sync also refreshes priority scores
4. Dashboard defaults to highest priority first
5. Priority filter and badge colors render correctly
