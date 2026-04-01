---
name: add-icp-builder
description: Add or update the JZ Demolition ICP builder with `icp_profiles` storage, `/api/leads/icp` routes, and `/dashboard/icp` management UI. Use when the user asks for ideal customer profiles, targeting rules, industries, job titles, locations, or the ICP builder in this app.
---

# Add ICP Builder

Use this skill when implementing or updating the ICP builder in this repository.

## Goal

Add ICP profile creation and management without broad dashboard refactors.

Default scope:

1. Add a migration for `icp_profiles`.
2. Add `GET` and `POST /api/leads/icp`.
3. Add `DELETE /api/leads/icp/[id]`.
4. Add `/dashboard/icp`.
5. Add or preserve the `ICP Builder` link in the dashboard nav.

## Repo Anchors

Follow these patterns unless the user says otherwise:

- Dashboard shell: `app/dashboard/page.tsx`, `app/dashboard/setup/page.tsx`
- Dashboard nav: `components/dashboard/nav.tsx`
- Existing ICP files: `lib/icp/schema.ts`, `components/dashboard/icp-builder.tsx`
- Supabase server and admin access: `lib/supabase/server.ts`, `lib/supabase/admin.ts`
- API route style: `app/api/export/route.ts`, `app/api/leads/gather-context/route.ts`
- Dashboard component styling: `components/dashboard/filters.tsx`, `components/dashboard/lead-detail-form.tsx`

## Required Output

Implement these parts:

1. A migration for `icp_profiles`
2. Shared validation or schema helpers when useful
3. `GET` and `POST /api/leads/icp`
4. `DELETE /api/leads/icp/[id]`
5. `/dashboard/icp` with creation and management UI
6. Dashboard nav integration for `ICP Builder`

## Data Rules

Use these defaults unless the repository already has a stronger rule:

- Return profiles ordered by `created_at desc`
- Validate payloads with `zod`
- Default `locations` to `["Miami, FL"]` when omitted
- Ensure `company_size_min <= company_size_max` when both are present
- Keep `Use in Pipeline` as a disabled placeholder unless the user explicitly asks for pipeline integration

## UI Constraints

- Match the existing dark dashboard styling language.
- Use `#0a0a0a`, `#1a1a1a`, and `#FF6B00` as the primary palette.
- Reuse existing card, input, and button patterns where possible.
- Prefer local client components for interactivity while keeping the page server-rendered when practical.
- Do not restyle unrelated screens.

## Implementation Workflow

Use this checklist:

```text
Task Progress:
- [ ] Inspect the dashboard shell, nav, and existing ICP helpers
- [ ] Add the `icp_profiles` migration
- [ ] Add or update validation and schema helpers
- [ ] Create or update `/api/leads/icp` GET and POST
- [ ] Create or update `/api/leads/icp/[id]` DELETE
- [ ] Build `/dashboard/icp` and any local interactive components
- [ ] Ensure the nav includes `ICP Builder`
- [ ] Verify auth, lint, and happy-path behavior
```

## Database

Add a new migration under `supabase/migrations/`. Do not modify old migrations in place.

Use this schema:

```sql
create table if not exists public.icp_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industries text[],
  company_size_min int,
  company_size_max int,
  job_titles text[],
  locations text[],
  is_active boolean default true,
  created_at timestamptz default now()
);
```

Recommended follow-up in the same migration:

- `alter table public.icp_profiles enable row level security;`
- Add an authenticated read policy if route handlers use the regular server client.
- Prefer admin-client writes from route handlers if that matches existing write behavior.

## API Routes

Create these route files:

- `app/api/leads/icp/route.ts`
- `app/api/leads/icp/[id]/route.ts`

### GET `/api/leads/icp`

- Verify the user is authenticated, consistent with `app/api/export/route.ts`.
- Return all `icp_profiles` ordered by `created_at desc`.
- Return a simple response shape such as `{ data: [...] }`.

### POST `/api/leads/icp`

- Verify the user is authenticated.
- Parse the JSON body.
- Validate the payload before writing. Prefer `zod`, since it already exists in `package.json`.
- Accept this shape:

```ts
type IcpProfilePayload = {
  name: string;
  industries?: string[];
  company_size_min?: number | null;
  company_size_max?: number | null;
  job_titles?: string[];
  locations?: string[];
};
```

- Enforce trimming and reasonable defaults.
- If `locations` is omitted, default to `["Miami, FL"]`.
- Ensure `company_size_min <= company_size_max` when both values are present.
- Insert a new row and return the inserted profile plus a success flag.

### DELETE `/api/leads/icp/[id]`

- Verify the user is authenticated.
- Validate the route param as a UUID.
- Delete the matching profile by `id`.
- Return `{ success: true }` on success.
- Return `404` when the profile does not exist.

## ICP Page

Create `app/dashboard/icp/page.tsx`. Prefer adding new components rather than editing current dashboard files.

If the page needs client interactivity, place it in local client components such as:

- `components/dashboard/icp-builder.tsx`
- `components/dashboard/tag-input.tsx`
- `components/dashboard/delete-icp-modal.tsx`

Keep the page itself server-rendered when practical.

### Layout

- Top half: create-profile form
- Bottom half: saved ICP profile cards
- Use the same max-width, panel borders, rounded corners, spacing, and button language as the current dashboard

### Form fields

- `Profile name`: text input
- `Industries`: tag input with presets:
  - `Commercial Real Estate`
  - `Healthcare`
  - `Hospitality`
  - `Government`
  - `Industrial`
  - `Retail`
- `Company size`: two number inputs for min/max employees
- `Job titles to target`: tag input with presets:
  - `VP of Construction`
  - `Facilities Director`
  - `Project Manager`
  - `Director of Real Estate`
  - `Property Manager`
- `Locations`: tag input defaulting to `Miami, FL`
- `Save Profile` button

### Saved profile cards

Each card should show:

- Name
- Industries
- Job titles
- Company size range

Each card should include:

- `Use in Pipeline` button, disabled for now
- `Delete` button
- Delete confirmation before removal

### Empty state

If there are no profiles yet, show a dashboard-styled empty state instead of blank space.

## Interaction Notes

- Load existing profiles on first render from `/api/leads/icp` or directly on the server.
- Keep the API route as the system of record even if the initial page load reads from Supabase directly.
- On save, post to `/api/leads/icp`, then refresh the list in place.
- On delete, call `/api/leads/icp/[id]`, then remove the deleted card from the UI.
- The disabled `Use in Pipeline` action is only a placeholder.

## Tag Input Guidance

Preferred approach:

1. Build a small local client component.
2. Support adding tags with Enter and removing them inline.
3. Support clicking preset chips to add values.
4. Prevent duplicate tags after trimming.

Do not add a new dependency just for tags.

## Modal Guidance

Search the repo for an existing dialog or modal pattern before building one.

If none exists:

- Use a lightweight in-page confirmation modal or confirmation panel with the existing dark theme.
- Do not add a dialog dependency by default.

## Navigation Link

Use the existing dashboard nav entry point:

- Add or preserve an `ICP Builder` link to `/dashboard/icp`

## Verification

After implementation, validate at least these:

1. Anonymous requests to the routes return `401`
2. Authenticated `GET /api/leads/icp` returns profiles ordered newest first
3. Authenticated `POST /api/leads/icp` creates a new profile
4. Authenticated `DELETE /api/leads/icp/[id]` removes the selected profile
5. `/dashboard/icp` shows the empty state when there are no profiles
6. Saved profiles render as cards with the disabled placeholder action
7. Delete requires confirmation before removal
8. Lints pass for touched files
