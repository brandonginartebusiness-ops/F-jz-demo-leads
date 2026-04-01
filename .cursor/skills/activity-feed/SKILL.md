---
name: activity-feed
description: Add or update the JZ Demolition activity feed with `activity_feed` storage, `/dashboard/activity`, lead-detail activity history, action logging for permit updates and sync jobs, and dashboard nav integration. Use when the user asks for activity history, lead notes logging, status-change logging, permit sync events, or the activity page in this app.
---

# Activity Feed

Use this skill when implementing or updating activity history in this repository.

## Goal

Ship a focused, chronological activity experience without broad dashboard refactors.

Default scope:

1. Store activity in `activity_feed`.
2. Render the full feed at `app/dashboard/activity/page.tsx`.
3. Show recent permit-specific activity on `app/dashboard/[id]/page.tsx`.
4. Log events when permit status or notes change and when new permits are synced.
5. Add or preserve the `Activity` link in `components/dashboard/nav.tsx`.

## Repo Anchors

Follow these patterns unless the user says otherwise:

- Dashboard shell: `app/dashboard/page.tsx`, `app/dashboard/analytics/page.tsx`
- Dashboard nav: `components/dashboard/nav.tsx`
- Lead detail layout: `app/dashboard/[id]/page.tsx`, `components/dashboard/lead-detail-form.tsx`
- Permit data access: `lib/permits/queries.ts`
- Server auth and reads: `lib/supabase/server.ts`
- Admin writes and cron jobs: `lib/supabase/admin.ts`, `app/api/cron/sync-permits/route.ts`

## Required Output

Implement these parts:

1. A migration for `activity_feed`
2. Query helpers for full-feed and permit-specific activity
3. A `/dashboard/activity` page with action-type filtering
4. Logging for:
   - `status_change`
   - `note_added`
   - `permit_synced`
5. A mini feed on the lead detail page that shows the latest 5 entries
6. An analytics stat for weekly activity volume

## Data Rules

Use these defaults unless the repository already has a stronger rule:

- `status_change`: write one row when `lead_status` changes
- `note_added`: write one row when `notes` changes; store the latest note text in `note`
- `permit_synced`: only log truly new permits, not every upsert
- Feed ordering: newest first
- Address display: use the related permit address; fall back to `Unknown address`

## UI Constraints

- Match the existing dark dashboard styling language.
- Keep `#0a0a0a`, `#1a1a1a`, and `#FF6B00` as the primary palette.
- Prefer simple server-rendered pages for feed reads unless a client component is needed for interaction.
- Do not restyle unrelated dashboard pages.

## Implementation Workflow

Use this checklist:

```text
Task Progress:
- [ ] Inspect dashboard nav, lead detail page, permit update flow, and cron sync flow
- [ ] Add the `activity_feed` migration
- [ ] Add shared activity types and query helpers
- [ ] Create or update the permit update endpoint so activity rows are written
- [ ] Log `permit_synced` rows only for new permits
- [ ] Build `/dashboard/activity`
- [ ] Add the mini feed to `/dashboard/[id]`
- [ ] Add the weekly activity stat to analytics
- [ ] Verify touched files are lint-clean
```

## Route Guidance

If a permit update route is needed:

- Use `PATCH /api/permits/[id]`
- Require an authenticated user
- Read the current permit first so old and new values can be compared
- Update the permit and write the needed activity rows in the same request flow
- Return a compact JSON response with the updated permit id

## Verification

After implementation, validate at least these:

1. `/dashboard/activity` renders and filters correctly
2. Changing lead status writes a `status_change` row
3. Saving notes writes a `note_added` row
4. Syncing permits only logs `permit_synced` for new records
5. `/dashboard/[id]` shows the latest 5 permit-specific entries
6. Analytics includes this week's activity count
