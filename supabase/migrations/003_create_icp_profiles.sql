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

create index if not exists icp_profiles_created_at_idx
on public.icp_profiles (created_at desc);

alter table public.icp_profiles enable row level security;

create policy "authenticated users can read icp profiles"
on public.icp_profiles
for select
to authenticated
using (true);
