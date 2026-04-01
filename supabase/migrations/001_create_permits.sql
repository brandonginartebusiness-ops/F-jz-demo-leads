~create extension if not exists pgcrypto;

create table if not exists public.permits (
  id uuid primary key default gen_random_uuid(),
  folio text unique,
  address text,
  standardized_address text,
  description text,
  estimated_value bigint,
  issued_date timestamptz,
  contractor_name text,
  status text,
  residential_commercial text,
  raw_data jsonb,
  created_at timestamptz not null default now(),
  lead_status text not null default 'new' check (lead_status in ('new', 'bookmarked', 'contacted', 'closed')),
  notes text
);

create index if not exists permits_lead_status_idx on public.permits (lead_status);
create index if not exists permits_issued_date_idx on public.permits (issued_date desc);
create index if not exists permits_estimated_value_idx on public.permits (estimated_value desc);

alter table public.permits enable row level security;

create policy "authenticated users can read permits"
on public.permits
for select
to authenticated
using (true);
