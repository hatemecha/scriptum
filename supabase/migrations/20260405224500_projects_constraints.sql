do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_title_length_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_title_length_check
      check (char_length(btrim(title)) between 1 and 200);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_author_length_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_author_length_check
      check (author is null or char_length(author) <= 200);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_description_length_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_description_length_check
      check (description is null or char_length(description) <= 500);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_language_value_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_language_value_check
      check (language in ('en', 'es', 'fr', 'de', 'pt', 'it', 'other'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_status_value_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_status_value_check
      check (status in ('draft', 'in-progress', 'finished', 'optioned', 'produced'));
  end if;
end
$$;
