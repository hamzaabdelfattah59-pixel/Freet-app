alter table profiles add column if not exists username text;
create unique index if not exists profiles_username_key on profiles (lower(username));
alter table profiles add column if not exists pf jsonb not null default '{}'::jsonb;

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    nullif(lower(new.raw_user_meta_data->>'username'), '')
  );
  return new;
end $$;
