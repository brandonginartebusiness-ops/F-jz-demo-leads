create table if not exists public.activity_feed (
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

create index if not exists activity_feed_created_at_idx
on public.activity_feed (created_at desc);

create index if not exists activity_feed_permit_id_created_at_idx
on public.activity_feed (permit_id, created_at desc);

create index if not exists activity_feed_action_type_idx
on public.activity_feed (action_type);

alter table public.activity_feed enable row level security;

create policy "authenticated users can read activity feed"
on public.activity_feed
for select
to authenticated
using (true);
