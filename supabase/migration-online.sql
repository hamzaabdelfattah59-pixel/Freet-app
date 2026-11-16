alter table outings add column if not exists data jsonb not null default '{}'::jsonb;

drop policy if exists "outings read" on outings;
create policy "outings read" on outings for select to authenticated
  using (owner_id = auth.uid() or is_member(id));

drop policy if exists "outings update" on outings;
create policy "outings update" on outings for update to authenticated
  using (is_member(id)) with check (is_member(id));

alter publication supabase_realtime add table outings;
