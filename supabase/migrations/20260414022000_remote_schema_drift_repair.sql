-- Repair remote schema drift detected during roadmap audit.
-- The hosted project is missing `profiles.preferences` and `projects.export_title_page`,
-- while application code and database functions already rely on both columns.

alter table public.profiles
  add column if not exists preferences jsonb not null default '{}'::jsonb;

comment on column public.profiles.preferences is
  'User-level product preferences (theme, editor tips, autosave, locale).';

alter table public.projects
  add column if not exists export_title_page jsonb not null default '{}'::jsonb;

comment on column public.projects.export_title_page is
  'Optional cover page metadata for PDF export (revised by, company block, etc.).';

drop function if exists public.save_project_snapshot(
  text,
  text,
  text,
  integer,
  text,
  integer,
  jsonb,
  text,
  text,
  text,
  text,
  text,
  timestamptz
);

create or replace function public.save_project_snapshot(
  p_project_id text,
  p_snapshot_id text,
  p_document_id text,
  p_revision integer,
  p_snapshot_kind text,
  p_document_schema_version integer,
  p_document_data jsonb,
  p_title text,
  p_author text,
  p_description text,
  p_language text,
  p_status text,
  p_saved_at timestamptz,
  p_export_title_page jsonb default '{}'::jsonb
)
returns public.projects
language plpgsql
security invoker
set search_path = ''
as $$
declare
  project_row public.projects;
  updated_project public.projects;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = 'P0001';
  end if;

  select *
  into strict project_row
  from public.projects
  where id = p_project_id
    and owner_profile_id = auth.uid()
    and deleted_at is null
  for update;

  insert into public.document_snapshots (
    id,
    project_id,
    owner_profile_id,
    document_id,
    revision,
    snapshot_kind,
    document_schema_version,
    document_data,
    created_at
  )
  values (
    p_snapshot_id,
    project_row.id,
    project_row.owner_profile_id,
    p_document_id,
    p_revision,
    p_snapshot_kind,
    p_document_schema_version,
    p_document_data,
    p_saved_at
  );

  update public.projects
  set title = p_title,
      author = p_author,
      description = p_description,
      language = p_language,
      status = p_status,
      export_title_page = p_export_title_page,
      current_snapshot_id = p_snapshot_id,
      latest_revision = p_revision,
      last_edited_at = p_saved_at,
      updated_at = p_saved_at
  where id = project_row.id
  returning * into strict updated_project;

  return updated_project;
exception
  when no_data_found then
    raise exception 'Project not found or not authorized' using errcode = 'P0002';
end;
$$;

revoke execute on function public.save_project_snapshot(
  text,
  text,
  text,
  integer,
  text,
  integer,
  jsonb,
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  jsonb
) from public;
revoke execute on function public.save_project_snapshot(
  text,
  text,
  text,
  integer,
  text,
  integer,
  jsonb,
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  jsonb
) from anon;
grant execute on function public.save_project_snapshot(
  text,
  text,
  text,
  integer,
  text,
  integer,
  jsonb,
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  jsonb
) to authenticated;
