-- Day 16: project rows for ownership checks (RLS aligned with SECURITY_BASE_DAY10)

create table if not exists public.projects (
  id text primary key,
  owner_profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  author text,
  description text,
  language text not null default 'en',
  status text not null default 'draft',
  current_snapshot_id text,
  latest_revision integer not null default 0,
  last_edited_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz
);

comment on table public.projects is 'Screenplay project metadata; ownership enforced by RLS.';

create index if not exists projects_owner_active_idx on public.projects (owner_profile_id)
  where deleted_at is null;

alter table public.projects enable row level security;

create policy "projects_select_own"
  on public.projects
  for select
  to authenticated
  using (auth.uid() = owner_profile_id and deleted_at is null);

create policy "projects_insert_own"
  on public.projects
  for insert
  to authenticated
  with check (auth.uid() = owner_profile_id);

create policy "projects_update_own"
  on public.projects
  for update
  to authenticated
  using (auth.uid() = owner_profile_id and deleted_at is null)
  with check (auth.uid() = owner_profile_id);

grant select, insert, update on table public.projects to authenticated;
