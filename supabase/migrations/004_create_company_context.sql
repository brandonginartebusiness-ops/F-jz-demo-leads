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

create index if not exists company_context_updated_at_idx
on public.company_context (updated_at desc);

alter table public.company_context enable row level security;

create policy "authenticated users can read company context"
on public.company_context
for select
to authenticated
using (true);
