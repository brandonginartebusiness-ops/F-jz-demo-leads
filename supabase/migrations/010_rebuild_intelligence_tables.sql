-- Drop old intelligence tables and rebuild with updated schema
-- Tables are empty (pipeline has not run yet), safe to drop

drop policy if exists "Authenticated users can read permit_ecosystem" on permit_ecosystem;
drop policy if exists "Authenticated users can read gc_profiles" on gc_profiles;
drop policy if exists "Authenticated users can read property_owners" on property_owners;

drop table if exists permit_ecosystem;
drop table if exists gc_profiles;
drop table if exists property_owners;

-- Remove old permits columns
alter table permits drop column if exists close_probability;
alter table permits drop column if exists close_factors;
alter table permits drop column if exists enriched_at;

-- permit_ecosystem: related permits and trade activity at a property
create table permit_ecosystem (
  id uuid primary key default gen_random_uuid(),
  permit_id uuid references permits(id) on delete cascade,
  folio text,
  related_permit_count int default 0,
  trade_types text[],
  sub_contractors text[],
  primary_gc text,
  activity_score int default 0,
  updated_at timestamptz default now(),
  unique(permit_id)
);

-- gc_profiles: contractor intelligence
create table gc_profiles (
  id uuid primary key default gen_random_uuid(),
  contractor_name text unique,
  total_permits_12mo int default 0,
  active_permits_90d int default 0,
  avg_project_value bigint default 0,
  primary_trades text[],
  geo_focus text[],
  demo_frequency int default 0,
  updated_at timestamptz default now()
);

-- property_owners: owner research
create table property_owners (
  id uuid primary key default gen_random_uuid(),
  folio text unique,
  owner_name text,
  owner_type text,
  mailing_address text,
  company_research jsonb,
  updated_at timestamptz default now()
);

-- New permits columns
alter table permits
  add column if not exists close_probability_score int default 0,
  add column if not exists close_probability_label text default 'Low';

-- RLS
alter table permit_ecosystem enable row level security;
alter table gc_profiles enable row level security;
alter table property_owners enable row level security;

create policy "Authenticated users can read permit_ecosystem"
  on permit_ecosystem for select to authenticated using (true);

create policy "Authenticated users can read gc_profiles"
  on gc_profiles for select to authenticated using (true);

create policy "Authenticated users can read property_owners"
  on property_owners for select to authenticated using (true);
