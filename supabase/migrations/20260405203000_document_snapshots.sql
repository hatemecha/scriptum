-- Pre-Day 17 hardening: immutable document snapshots and active snapshot pointer integrity.

create table if not exists public.document_snapshots (
  id text primary key,
  project_id text not null references public.projects (id) on delete cascade,
  owner_profile_id uuid not null references public.profiles (id) on delete cascade,
  document_id text not null,
  revision integer not null check (revision >= 0),
  snapshot_kind text not null default 'autosave',
  document_schema_version integer not null check (document_schema_version >= 1),
  document_data jsonb not null,
  created_at timestamptz not null default now()
);

comment on table public.document_snapshots is
  'Immutable screenplay revisions. Active version is referenced by projects.current_snapshot_id.';

-- Required for the composite FK from projects(id, current_snapshot_id).
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'document_snapshots_project_id_id_key'
      and conrelid = 'public.document_snapshots'::regclass
  ) then
    alter table public.document_snapshots
      add constraint document_snapshots_project_id_id_key unique (project_id, id);
  end if;
end
$$;

create unique index if not exists document_snapshots_project_revision_key
  on public.document_snapshots (project_id, revision);

create index if not exists document_snapshots_owner_created_idx
  on public.document_snapshots (owner_profile_id, created_at desc);

alter table public.document_snapshots enable row level security;

create policy "document_snapshots_select_own"
  on public.document_snapshots
  for select
  to authenticated
  using (auth.uid() = owner_profile_id);

create policy "document_snapshots_insert_own"
  on public.document_snapshots
  for insert
  to authenticated
  with check (auth.uid() = owner_profile_id);

grant select, insert on table public.document_snapshots to authenticated;

-- Ensure the active snapshot pointer belongs to the same project row.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_current_snapshot_same_project_fk'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_current_snapshot_same_project_fk
      foreign key (id, current_snapshot_id)
      references public.document_snapshots (project_id, id)
      on update cascade
      on delete set null
      deferrable initially deferred;
  end if;
end
$$;
