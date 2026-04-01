---
name: add-icp-builder
description: Add an ICP (Ideal Customer Profile) builder to the JZ Demolition portal with a Supabase icp_profiles table, /api/leads/icp routes, and a /dashboard/icp page. Use when the user asks for ICP profiles, ideal customer profile management, target industries/titles/location filters, or the ICP builder in this app.
---

# Add ICP Builder

Use this skill when implementing or updating the ICP builder in this repository.

## Goal

Add ICP profile creation and management without broadly rewriting the existing portal.

Default scope:

1. Add a new Supabase migration for `icp_profiles`.
2. Add `/api/leads/icp` with `GET` and `POST`.
3. Add `/api/leads/icp/[id]` with `DELETE`.
4. Add `/dashboard/icp`.
5. Only modify existing files when needed to add an `ICP Builder` nav/sidebar link.

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
- Reuse the same card, input, and button styling patterns already present in dashboard components.
- Do not restyle unrelated screens.
- Do not edit existing files except for the nav/sidebar link, unless the user later approves more.
- If there is no actual shared nav/sidebar entry point yet, ask before introducing one just for this page.

## Implementation Workflow

Copy this checklist and work through it:

```text
Task Progress:
- [ ] Inspect the current dashboard/nav entry point
- [ ] Add a new Supabase migration for icp_profiles
- [ ] Add /api/leads/icp GET and POST
- [ ] Add /api/leads/icp/[id] DELETE
- [ ] Add /dashboard/icp page and any new local components
- [ ] Add ICP Builder nav link only if a nav already exists
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
- Prefer admin-client writes from route handlers if that matches the existing data-write pattern.

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

If the page needs client interactivity, place it in new client components such as:

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
- Delete confirmation modal before removal

### Empty state

If there are no profiles yet, show a dashboard-styled empty state instead of blank space.

## Interaction Notes

- Load existing profiles on first render from `/api/leads/icp` or directly on the server.
- Keep the API route as the system of record even if the initial page load reads from Supabase directly.
- On save, post to `/api/leads/icp`, then refresh the list in place.
- On delete, call `/api/leads/icp/[id]`, then remove the deleted card from the UI.
- The disabled `Use in Pipeline` action is only a placeholder. Do not implement pipeline behavior yet.

## Tag Input Guidance

There is no existing shared tag-input component in this repo.

Preferred approach:

1. Build a small local client component.
2. Support adding tags with Enter and removing them inline.
3. Support clicking preset chips to add values.
4. Prevent duplicate tags after trimming.

Do not add a new dependency just for tags.

## Modal Guidance

Search the repo for an existing dialog/modal pattern before building one.

If none exists:

- Use a lightweight in-page confirmation modal or confirmation panel with the existing dark theme.
- Do not add a dialog dependency unless the user approves it.

## Navigation Link

Locate the actual dashboard nav or sidebar entry point before editing.

Allowed existing-file change:

- Add an `ICP Builder` link to `/dashboard/icp`

Do not use this as permission to refactor the surrounding dashboard layout.

If the current repo does not yet have a reusable nav/sidebar component, ask before introducing a wider dashboard shell just to host the link.

## Auth And Data Access

Follow current portal auth behavior:

- Server-rendered pages may read with `createClient()` from `lib/supabase/server.ts`
- Browser interactions may use `lib/supabase/client.ts` if needed
- Admin-only writes should use `createAdminClient()` from route handlers when RLS would otherwise block the operation

Do not invent a second auth system.

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

## Output Style

When completing the task:

- Briefly summarize what was added
- Mention any assumptions, especially around nav placement or modal behavior
- Call out if a dependency would be needed for a more advanced modal or tag input
