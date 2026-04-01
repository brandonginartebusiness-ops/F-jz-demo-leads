alter table public.permits
add column if not exists lead_type text not null default 'unknown';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'permits_lead_type_check'
  ) then
    alter table public.permits
    add constraint permits_lead_type_check check (
      lead_type in (
        'unknown',
        'full_demolition',
        'partial_demolition',
        'demo_related',
        'junk'
      )
    );
  end if;
end $$;

create index if not exists idx_permits_issued_date
on public.permits(permit_issued_date desc);

create index if not exists idx_permits_lead_status
on public.permits(lead_status);

create index if not exists idx_permits_res_comm
on public.permits(residential_commercial);

create index if not exists idx_permits_estimated_value
on public.permits(estimated_value desc);

create index if not exists idx_permits_lead_type
on public.permits(lead_type);

create index if not exists idx_permits_priority_score
on public.permits(priority_score desc);
