---
name: add-company-setup-page
description: Add the JZ Demolition company setup flow, company_context schema, gather-context API route, and /dashboard/setup UI in this portal. Use when the user asks for setup onboarding, company context capture, leads context management, tone/voice setup, or the company setup page in the JZ Demolition app.
---

# Add Company Setup Page

Use this skill when implementing or updating the JZ Demolition company setup flow in this repository.

## Goal

Add a company setup experience without broadly rewriting the existing portal.

Default scope:

1. Add a Supabase migration for `company_context`.
2. Add `/api/leads/gather-context` with `GET` and `POST`.
3. Add `/dashboard/setup`.
4. Only modify existing files when needed to add the `Setup` nav/sidebar link or its warning indicator.

If the request would require broader edits to existing dashboard files, stop and ask before proceeding.

## Repo Anchors

Use these existing patterns unless the user asks otherwise:

- Supabase server client: `lib/supabase/server.ts`
- Supabase browser client: `lib/supabase/client.ts`
- Supabase admin client: `lib/supabase/admin.ts`
- Existing API route style: `app/api/export/route.ts`, `app/api/cron/sync-permits/route.ts`
- Existing dashboard styling: `app/dashboard/page.tsx`, `components/dashboard/filters.tsx`, `components/dashboard/lead-detail-form.tsx`
- Theme tokens: `app/globals.css`

## Constraints

- Preserve the current dark UI language.
- Match the existing accent color `#c9a84c`.
- Keep page backgrounds aligned with the current dashboard look. If the request explicitly says `#0f0f1a`, use that on the new setup page while still fitting the existing theme tokens.
- Do not restyle unrelated screens.
- Do not edit existing files except for the nav/sidebar link and warning dot, unless the user later approves more.

## Implementation Workflow

Copy this checklist and work through it:

```text
Task Progress:
- [ ] Inspect the current dashboard/nav entry point
- [ ] Add a new Supabase migration for company_context
- [ ] Add typed helpers for reading/writing company_context if useful
- [ ] Add /api/leads/gather-context route
- [ ] Add /dashboard/setup page and any new local components
- [ ] Add Setup nav link with warning dot
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
- Add an authenticated read policy if the rest of the portal follows that pattern.
- Add authenticated write policy if route handlers use the regular server client.
- If writes should bypass RLS, keep the public read policy narrow and use `createAdminClient()` in the API route instead.

Because this flow always stores one logical row:

- `GET` should return the newest or only row.
- `POST` may delete all rows then insert one replacement row, or perform an equivalent single-row reset.
- Keep the response shape simple and stable.

## API Route

Create `app/api/leads/gather-context/route.ts`.

### GET

- Verify the user is authenticated, consistent with `app/api/export/route.ts`.
- Read the single `company_context` row.
- Return `{ data: ... }` or `{ data: null }`.

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

Store `service_areas` as a text field in the database. In the UI, the tag input can serialize to a comma-separated string unless the user asks for a different format.

## Setup Page

Create `app/dashboard/setup/page.tsx`. Prefer adding new components rather than editing current dashboard files.

If the form has meaningful client interactivity, place it in a new client component such as `components/dashboard/company-setup-form.tsx` and keep the page itself server-rendered.

### UI requirements

- 3-step form
- Existing dark Tailwind language
- Accent color `#c9a84c`
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

Keep the GET and POST route as the system of record even if the initial page load reads from Supabase directly.

## Toasts

Before implementing a toast:

1. Search the repo for an existing toast library or pattern.
2. Reuse it if present.
3. If none exists, ask before adding a new dependency unless the user already approved dependency changes.

If no toast library exists and the user does not want new dependencies, use a lightweight inline success state instead of silently ignoring the requirement.

## Navigation Link

Locate the actual dashboard nav or sidebar entry point before editing.

Allowed existing-file change:

- Add a `Setup` link to `/dashboard/setup`
- Add a yellow warning dot when `company_context` is empty

Do not use this as permission to refactor the surrounding dashboard layout.

If the current repo does not yet have a reusable sidebar/nav component, ask before introducing a wider dashboard shell just to host the link.

## Warning Dot Logic

The warning dot should indicate missing setup data.

Preferred logic:

- Treat the setup as incomplete when no `company_context` row exists.
- If a stricter rule is requested later, derive completeness from required fields rather than just row presence.

## Auth And Data Access

Follow current portal auth behavior:

- Server-rendered pages may read with `createClient()` from `lib/supabase/server.ts`
- Browser interactions may use `lib/supabase/client.ts` if needed
- Admin-only writes should use `createAdminClient()` from route handlers when RLS would otherwise block the operation

Do not invent a second auth system.

## Verification

After implementation, validate at least these:

1. Anonymous requests to the route return `401`
2. Authenticated `GET` returns `null` or the current row
3. Authenticated `POST` replaces previous data with one row
4. `/dashboard/setup` pre-fills when data exists
5. Submit success returns the user to `/dashboard`
6. Nav warning dot disappears once context exists
7. Lints pass for touched files

## Output Style

When completing the task:

- Briefly summarize what was added
- Mention any assumptions, especially around nav placement or toast behavior
- Call out if a dependency would be needed for a real toast
