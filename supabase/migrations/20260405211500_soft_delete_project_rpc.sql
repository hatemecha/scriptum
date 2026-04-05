create or replace function public.soft_delete_project(p_project_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
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

grant execute on function public.soft_delete_project(text) to authenticated;
