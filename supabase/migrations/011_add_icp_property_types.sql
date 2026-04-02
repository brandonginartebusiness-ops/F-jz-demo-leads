alter table public.icp_profiles
add column if not exists property_types text[] not null default array['commercial'];
