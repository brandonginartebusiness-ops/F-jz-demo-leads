create extension if not exists pgcrypto;

drop table if exists public.activity_feed;
drop table if exists public.permits;

create table public.permits (
  id uuid primary key default gen_random_uuid(),

  permit_number text unique not null,
  process_number text,
  master_permit_number text,
  folio_number text,

  permit_type text,
  application_type_code integer,
  application_type_description text,
  proposed_use_code integer,
  proposed_use_description text,
  detail_description text,
  residential_commercial text,

  permit_issued_date date,
  application_date timestamptz,
  last_inspection_date text,
  last_approved_insp_date text,
  cocc_date text,

  property_address text,
  legal_description_1 text,
  legal_description_2 text,
  city text,
  state text,

  estimated_value bigint,
  permit_total_fee text,
  square_footage integer,
  structure_units integer,
  structure_floors integer,

  owner_name text,

  contractor_number text,
  contractor_name text,
  contractor_address text,
  contractor_city text,
  contractor_state text,
  contractor_zip text,
  contractor_phone text,

  architect_name text,

  raw_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  lead_status text default 'new' check (
    lead_status in (
      'new',
      'bookmarked',
      'contacted',
      'in_progress',
      'closed_won',
      'closed_lost'
    )
  ),
  priority_score integer default 0,
  notes text
);

create index idx_permits_issued_date on public.permits(permit_issued_date desc);
create index idx_permits_lead_status on public.permits(lead_status);
create index idx_permits_res_comm on public.permits(residential_commercial);
create index idx_permits_estimated_value on public.permits(estimated_value desc);
create index idx_permits_priority_score on public.permits(priority_score desc);

alter table public.permits enable row level security;

create policy "authenticated users can read permits"
on public.permits
for select
to authenticated
using (true);

create table public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  permit_id uuid references public.permits(id) on delete cascade,
  action_type text,
  old_value text,
  new_value text,
  note text,
  created_at timestamptz not null default now(),
  constraint activity_feed_action_type_check check (
    action_type in ('status_change', 'note_added', 'permit_synced')
  )
);

create index activity_feed_created_at_idx
on public.activity_feed (created_at desc);

create index activity_feed_permit_id_created_at_idx
on public.activity_feed (permit_id, created_at desc);

create index activity_feed_action_type_idx
on public.activity_feed (action_type);

alter table public.activity_feed enable row level security;

create policy "authenticated users can read activity feed"
on public.activity_feed
for select
to authenticated
using (true);
