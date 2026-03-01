begin;

-- Guard rail: the MVP relies on this table.
do $$
begin
  if to_regclass('public.announcements') is null then
    raise exception 'Table public.announcements introuvable';
  end if;
end
$$;

-- 1) Data hygiene for target_school
update public.announcements
set target_school = 'All'
where target_school is null or btrim(target_school) = '';

alter table public.announcements
  alter column target_school set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'announcements_target_school_not_empty_chk'
      and conrelid = 'public.announcements'::regclass
  ) then
    alter table public.announcements
      add constraint announcements_target_school_not_empty_chk
      check (char_length(btrim(target_school)) > 0);
  end if;
end
$$;

-- 2) Performance indexes for Nexus MVP
create index if not exists announcements_target_school_created_at_idx
  on public.announcements (target_school, created_at desc);

create index if not exists announcements_user_id_created_at_idx
  on public.announcements (user_id, created_at desc);

create index if not exists announcements_collab_type_created_at_idx
  on public.announcements (collab_type, created_at desc);

create index if not exists announcements_tags_gin_idx
  on public.announcements using gin (tags);

-- 3) RLS: targeted matching + owner/admin write controls
alter table public.announcements enable row level security;

-- Drop/recreate for idempotent reruns
drop policy if exists announcements_select_targeted on public.announcements;
drop policy if exists announcements_insert_owner on public.announcements;
drop policy if exists announcements_update_owner_or_admin on public.announcements;
drop policy if exists announcements_delete_owner_or_admin on public.announcements;

create policy announcements_select_targeted
on public.announcements
for select
to authenticated
using (
  target_school = 'All'
  or target_school = coalesce(
    (select p.school from public.profiles p where p.id = auth.uid()),
    ''
  )
  or user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

create policy announcements_insert_owner
on public.announcements
for insert
to authenticated
with check (
  auth.uid() is not null
  and user_id = auth.uid()
  and char_length(btrim(target_school)) > 0
);

create policy announcements_update_owner_or_admin
on public.announcements
for update
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

create policy announcements_delete_owner_or_admin
on public.announcements
for delete
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

commit;
