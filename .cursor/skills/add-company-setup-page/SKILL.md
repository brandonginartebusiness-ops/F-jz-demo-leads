---
name: add-company-setup-page
description: Add the JZ Demolition company setup flow, company_context schema, gather-context API route, and /dashboard/setup UI in this portal. Use when the user asks for setup onboarding, company context capture, leads context management, tone/voice setup, or the company setup page in the JZ Demolition app.
---

# Add Company Setup Page

Use this skill when implementing or updating the JZ Demolition company setup flow in this repository.

## Goal

Add a focused company setup experience without broad dashboard refactors.

Default scope:

1. Add a Supabase migration for `company_context`.
2. Add `/api/leads/gather-context` with `GET` and `POST`.
3. Add `/dashboard/setup`.
4. Add or preserve the `Setup` link and missing-setup warning state in the dashboard nav.

## Repo Anchors

Follow these patterns unless the user says otherwise:

- Dashboard shell: `app/dashboard/page.tsx`, `app/dashboard/analytics/page.tsx`
- Dashboard nav: `components/dashboard/nav.tsx`
- Existing setup data helpers: `lib/company-context/queries.ts`, `lib/company-context/schema.ts`
- Supabase server and admin access: `lib/supabase/server.ts`, `lib/supabase/admin.ts`
- API route style: `app/api/export/route.ts`, `app/api/leads/icp/route.ts`
- Existing dashboard form styling: `components/dashboard/lead-detail-form.tsx`, `components/dashboard/filters.tsx`

## Required Output

Implement these parts:

1. A migration for `company_context`
2. Shared validation and query helpers when useful
3. `GET` and `POST /api/leads/gather-context`
4. `/dashboard/setup` plus any local setup form components
5. Setup-warning nav integration when context is missing

## Data Rules

Use these defaults unless the repository already has a stronger rule:

- Store a single logical company context row
- `GET` should return the newest row or `null`
- `POST` may replace the prior row to preserve single-record behavior
- Validate payloads with `zod`
- Keep `service_areas` as a text field unless the user explicitly asks for arrays

## UI Constraints

- Match the existing dark dashboard styling language.
- Use `#0a0a0a`, `#1a1a1a`, and `#FF6B00` as the primary palette.
- Keep the page server-rendered when practical and move form interactivity into local client components.
- Do not restyle unrelated screens.

## Implementation Workflow

Use this checklist:

```text
Task Progress:
- [ ] Inspect the dashboard shell, nav, and existing company-context helpers
- [ ] Add the `company_context` migration
- [ ] Add or update validation and query helpers
- [ ] Create or update `app/api/leads/gather-context/route.ts`
- [ ] Build `app/dashboard/setup/page.tsx` and local setup form components
- [ ] Ensure the nav includes `Setup` plus a missing-context warning indicator
- [ ] Verify auth, lint, and happy-path behavior
```

## Database

Add a new migration under `supabase/migrations/`. Do not modify old migrations in place.

Use this schema:

```sql
create table if not exists public.company_context (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  offering text,
  service_areas text,
  target_market text,
  value_prop text,
  differentiators text,
  avg_project_size text,
  tone text,
  updated_at timestamptz default now()
);
```

Recommended follow-up in the same migration:

- `alter table public.company_context enable row level security;`
- Add an authenticated read policy when the rest of the portal follows that pattern.
- Prefer admin-client writes from route handlers if that matches existing write behavior.

## API Route

Create `app/api/leads/gather-context/route.ts`.

### GET

- Verify the user is authenticated, consistent with `app/api/export/route.ts`.
- Read the latest `company_context` row.
- Return a simple shape such as `{ data: ... }` or `{ data: null }`.

### POST

- Verify the user is authenticated.
- Parse JSON body.
- Validate the payload before writing. Prefer `zod`, since it already exists in `package.json`.
- Enforce allowed values for:
  - `avg_project_size`: `Under $500K`, `$500K-$2M`, `$2M-$10M`, `"$10M+"`
  - `tone`: `Professional`, `Direct`, `Conversational`, `Aggressive`
- For the single-row requirement, delete existing rows and insert one fresh row, or use an equivalent transactional approach.
- Return the inserted row plus a success flag.

Suggested payload shape:

```ts
type CompanyContextPayload = {
  company_name: string;
  offering: string;
  service_areas: string;
  target_market?: string;
  value_prop: string;
  differentiators: string;
  avg_project_size: "Under $500K" | "$500K-$2M" | "$2M-$10M" | "$10M+";
  tone: "Professional" | "Direct" | "Conversational" | "Aggressive";
};
```

## Setup Page

Create `app/dashboard/setup/page.tsx`. Prefer adding new components rather than editing current dashboard files.

If the form has meaningful client interactivity, place it in a local client component such as `components/dashboard/company-setup-form.tsx`.

### UI requirements

- 3-step form
- Existing dark Tailwind language
- Accent color `#FF6B00`
- Top progress bar showing step `1 / 2 / 3`
- Last-updated banner when data already exists
- Submit posts to `/api/leads/gather-context`
- Success toast, then redirect to `/dashboard`

### Steps

#### Step 1: Company Basics

- `company_name`
- `service_areas` as tag input
- `offering` as textarea

#### Step 2: Value Proposition

- `value_prop` as textarea
- `differentiators` as textarea
- `avg_project_size` select with:
  - `Under $500K`
  - `$500K-$2M`
  - `$2M-$10M`
  - `"$10M+"`

#### Step 3: Tone & Voice

- `tone` as radio-card choices:
  - `Professional`
  - `Direct`
  - `Conversational`
  - `Aggressive`
- Show a live preview blurb for demolition outreach tone

Use copy that fits the product, such as outreach for commercial demolition, tenant improvement tear-outs, or site-clearing opportunities.

## Data Loading

When the page loads:

1. Fetch existing context from `/api/leads/gather-context` or directly on the server.
2. Pre-fill all fields if data exists.
3. Show a banner like `Last updated [date]`.

Keep the route as the system of record even if the initial page load reads from Supabase directly.

## Toasts

Before implementing a toast, search for an existing toast pattern first. If none exists and no dependency change was requested, use a lightweight inline success state instead of adding a new package by default.

## Navigation Link

Use the existing dashboard nav entry point:

- Add or preserve a `Setup` link to `/dashboard/setup`
- Show a warning dot when `company_context` is empty

## Warning Dot Logic

The warning dot should indicate missing setup data.

Preferred logic:

- Treat the setup as incomplete when no `company_context` row exists.
- If a stricter rule is requested later, derive completeness from required fields rather than just row presence.

## Verification

After implementation, validate at least these:

1. Anonymous requests to the route return `401`
2. Authenticated `GET` returns `null` or the current row
3. Authenticated `POST` replaces previous data with one row
4. `/dashboard/setup` pre-fills when data exists
5. Submit success returns the user to `/dashboard`
6. Nav warning dot disappears once context exists
7. Lints pass for touched files
