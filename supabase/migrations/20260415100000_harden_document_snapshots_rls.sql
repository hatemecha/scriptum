-- Day 40: tighten snapshot ownership guarantees.
-- Prevent cross-project inserts by requiring the referenced project be owned by the current user.

alter table public.document_snapshots enable row level security;

drop policy if exists "document_snapshots_insert_own" on public.document_snapshots;
create policy "document_snapshots_insert_own"
  on public.document_snapshots
  for insert
  to authenticated
  with check (
    auth.uid() = owner_profile_id
    and exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.owner_profile_id = auth.uid()
        and p.deleted_at is null
    )
  );

drop policy if exists "document_snapshots_select_own" on public.document_snapshots;
create policy "document_snapshots_select_own"
  on public.document_snapshots
  for select
  to authenticated
  using (
    auth.uid() = owner_profile_id
    and exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.owner_profile_id = auth.uid()
        and p.deleted_at is null
    )
  );

