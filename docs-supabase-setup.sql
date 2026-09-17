-- Team playbook storage for ulti_drill.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> Run.

create table if not exists public.plays (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  category text not null default 'play',
  description text not null default '',
  tags text[] not null default '{}',
  frames jsonb not null default '[]'::jsonb,
  frame_notes jsonb not null default '[]'::jsonb,
  author text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.plays enable row level security;

-- Anyone holding the anon key (i.e. anyone with the site URL) can read and
-- write. Fine for a squad playbook; tighten later if the link spreads.
create policy "team read"   on public.plays for select using (true);
create policy "team insert" on public.plays for insert with check (true);
create policy "team update" on public.plays for update using (true) with check (true);
create policy "team delete" on public.plays for delete using (true);
