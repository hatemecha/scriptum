create schema if not exists private;

create or replace function private.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta_name text;
begin
  meta_name := nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), '');

  insert into public.profiles (
    id,
    email,
    display_name,
    plan,
    preferences,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    meta_name,
    'free',
    '{}'::jsonb,
    coalesce(new.created_at, now()),
    coalesce(new.created_at, now())
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function private.handle_new_user_profile();

drop function if exists public.handle_new_user_profile();

create or replace function public.soft_delete_project(p_project_id text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = 'P0001';
  end if;

  update public.projects
  set deleted_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = p_project_id
    and owner_profile_id = auth.uid()
    and deleted_at is null;

  if not found then
    raise exception 'Project not found or not authorized' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.soft_delete_project(text) from public;
revoke execute on function public.soft_delete_project(text) from anon;
grant execute on function public.soft_delete_project(text) to authenticated;

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
  p_saved_at timestamptz
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
  timestamptz
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
  timestamptz
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
  timestamptz
) to authenticated;
