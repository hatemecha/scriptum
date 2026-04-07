-- Atomic merge of profiles.preferences for the current user (avoids read-modify-write races).

create or replace function public.merge_profile_preferences(p_patch jsonb)
returns public.profiles
language plpgsql
security invoker
set search_path = public
as $$
declare
  result public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = 'P0001';
  end if;

  if p_patch is null or p_patch = '{}'::jsonb then
    select * into strict result
      from public.profiles
      where id = auth.uid()
        and deleted_at is null;
    return result;
  end if;

  update public.profiles
  set preferences = coalesce(preferences, '{}'::jsonb) || p_patch
  where id = auth.uid()
    and deleted_at is null
  returning * into strict result;

  return result;
exception
  when no_data_found then
    raise exception 'Profile not found' using errcode = 'P0001';
end;
$$;

comment on function public.merge_profile_preferences(jsonb) is
  'Merges jsonb keys into profiles.preferences for auth.uid(); single row update.';

grant execute on function public.merge_profile_preferences(jsonb) to authenticated;
