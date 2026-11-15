-- شغّل الملف ده كله مرة واحدة في Supabase > SQL Editor

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  created_at timestamptz default now()
);

create table outings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references profiles(id),
  title text not null,
  place text,
  invite_code text unique not null default substr(md5(gen_random_uuid()::text), 1, 8),
  created_at timestamptz default now()
);

create table members (
  outing_id uuid references outings on delete cascade,
  user_id uuid default auth.uid() references profiles(id) on delete cascade,
  budget int check (budget >= 0),
  primary key (outing_id, user_id)
);

create table slots (
  id uuid primary key default gen_random_uuid(),
  outing_id uuid not null references outings on delete cascade,
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  check (ends_at > starts_at)
);

-- ملف شخصي تلقائي عند التسجيل
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- صاحب الخروجة يتضاف عضو تلقائي
create function add_owner_member() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into members (outing_id, user_id) values (new.id, new.owner_id);
  return new;
end $$;
create trigger on_outing_created after insert on outings
  for each row execute function add_owner_member();

create function is_member(oid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from members where outing_id = oid and user_id = auth.uid());
$$;

-- الانضمام بكود الدعوة
create function join_outing(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare oid uuid;
begin
  select id into oid from outings where invite_code = code;
  if oid is null then raise exception 'invalid code'; end if;
  insert into members (outing_id) values (oid) on conflict do nothing;
  return oid;
end $$;
grant execute on function join_outing(text) to authenticated;

-- الأمان (RLS)
alter table profiles enable row level security;
alter table outings  enable row level security;
alter table members  enable row level security;
alter table slots    enable row level security;

create policy "profiles read"   on profiles for select to authenticated using (true);
create policy "profiles update" on profiles for update to authenticated using (id = auth.uid());

create policy "outings read"   on outings for select to authenticated using (is_member(id));
create policy "outings insert" on outings for insert to authenticated with check (owner_id = auth.uid());
create policy "outings update" on outings for update to authenticated using (owner_id = auth.uid());
create policy "outings delete" on outings for delete to authenticated using (owner_id = auth.uid());

create policy "members read"   on members for select to authenticated using (is_member(outing_id));
create policy "members update" on members for update to authenticated using (user_id = auth.uid());
create policy "members delete" on members for delete to authenticated using (user_id = auth.uid());

create policy "slots read"   on slots for select to authenticated using (is_member(outing_id));
create policy "slots insert" on slots for insert to authenticated with check (user_id = auth.uid() and is_member(outing_id));
create policy "slots delete" on slots for delete to authenticated using (user_id = auth.uid());

-- تحديث لحظي
alter publication supabase_realtime add table members, slots;
