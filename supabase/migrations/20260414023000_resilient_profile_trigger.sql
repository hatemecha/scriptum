-- Make auth sign-up resilient to profile sync failures.
-- The app can self-heal missing profiles on first authenticated request via `ensureUserProfile`,
-- so auth.users creation must not fail if the product profile insert encounters an issue.

create or replace function private.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  meta_name text;
begin
  meta_name := nullif(btrim(coalesce(new.raw_user_meta_data->>'display_name', '')), '');

  begin
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
  exception
    when others then
      raise warning 'private.handle_new_user_profile failed for auth.users.id=%: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

comment on function private.handle_new_user_profile() is
  'Best-effort mirror from auth.users to public.profiles; never aborts signup.';

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function private.handle_new_user_profile();

insert into public.profiles (
  id,
  email,
  display_name,
  plan,
  preferences,
  created_at,
  updated_at
)
select
  user_row.id,
  user_row.email,
  nullif(btrim(coalesce(user_row.raw_user_meta_data->>'display_name', '')), ''),
  'free',
  '{}'::jsonb,
  coalesce(user_row.created_at, now()),
  coalesce(user_row.created_at, now())
from auth.users as user_row
left join public.profiles as profile_row
  on profile_row.id = user_row.id
where profile_row.id is null
on conflict (id) do nothing;
