-- permit_ecosystem: stores related permits found at the same address/folio
create table if not exists permit_ecosystem (
  id uuid default gen_random_uuid() primary key,
  permit_id uuid not null references permits(id) on delete cascade,
  related_permit_number text not null,
  related_description text,
  related_value numeric,
  related_date date,
  relationship_type text not null check (relationship_type in ('same_address', 'same_folio', 'same_owner')),
  created_at timestamptz default now()
);

create index if not exists idx_permit_ecosystem_permit_id on permit_ecosystem(permit_id);
create unique index if not exists idx_permit_ecosystem_unique on permit_ecosystem(permit_id, related_permit_number);

-- gc_profiles: aggregated contractor intelligence
create table if not exists gc_profiles (
  id uuid default gen_random_uuid() primary key,
  contractor_name text unique not null,
  total_jobs integer default 0,
  demo_jobs integer default 0,
  total_value numeric default 0,
  avg_value numeric default 0,
  first_seen date,
  last_seen date,
  top_addresses jsonb default '[]',
  updated_at timestamptz default now()
);

create index if not exists idx_gc_profiles_name on gc_profiles(contractor_name);

-- property_owners: property owner research results
create table if not exists property_owners (
  id uuid default gen_random_uuid() primary key,
  folio_number text unique not null,
  owner_name text,
  owner_type text check (owner_type in ('individual', 'corporation', 'llc', 'trust', 'government')),
  mailing_address text,
  assessed_value numeric,
  land_use text,
  research_notes text,
  source text,
  updated_at timestamptz default now()
);

create index if not exists idx_property_owners_folio on property_owners(folio_number);

-- permits table additions
alter table permits add column if not exists close_probability integer;
alter table permits add column if not exists close_factors jsonb;
alter table permits add column if not exists enriched_at timestamptz;

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
