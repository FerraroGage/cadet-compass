-- Cadet Compass: database for accounts. Run this once in the Supabase SQL editor (free tier).
-- It can be run again safely.
--
-- Rules this file enforces:
--   1. A cadet can read and write only their own rows (row-level security on every table).
--   2. XP cannot be set by the app. Only award_xp() changes it, and it works the points out itself.
--   3. Deleting the account deletes every row that belongs to it.
-- Stored per cadet: display name, avatar number, branch, region (a state, never a precise location),
-- level, XP events and card progress. Email and password are held by Supabase Auth, not in these tables.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null default 'Cadet',
  avatar smallint not null default 0 check (avatar between 0 and 7),
  branch text check (branch in ('usmc', 'army', 'navy', 'usaf', 'ussf', 'uscg')),
  region text check (char_length(region) <= 40),
  level text check (char_length(level) <= 20),
  terms_version text check (char_length(terms_version) <= 20),
  xp integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  user_id uuid not null references auth.users on delete cascade,
  fact_id text not null check (char_length(fact_id) <= 120),
  card jsonb not null check (pg_column_size(card) < 400),
  updated_at timestamptz not null default now(),
  primary key (user_id, fact_id)
);

create table if not exists public.xp_events (
  id uuid primary key,
  user_id uuid not null references auth.users on delete cascade,
  kind text not null,
  day date not null,
  pts integer not null,
  score numeric,
  n integer,
  created_at timestamptz not null default now()
);
create index if not exists xp_events_user_kind_day on public.xp_events (user_id, kind, day);

-- ---- Row-level security ------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.xp_events enable row level security;

revoke all on public.profiles, public.progress, public.xp_events from anon, authenticated;

-- Profile: read your own; change only the columns listed. xp, id and created_at are not on the list.
grant select on public.profiles to authenticated;
grant update (display_name, avatar, branch, region, level, terms_version) on public.profiles to authenticated;
drop policy if exists "own profile: read" on public.profiles;
create policy "own profile: read" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "own profile: update" on public.profiles;
create policy "own profile: update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Card progress: all your own.
grant select, insert, update, delete on public.progress to authenticated;
drop policy if exists "own progress" on public.progress;
create policy "own progress" on public.progress for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- XP events: read your own. There is no insert, update or delete policy: only award_xp() writes here.
grant select on public.xp_events to authenticated;
drop policy if exists "own xp events: read" on public.xp_events;
create policy "own xp events: read" on public.xp_events for select to authenticated using (auth.uid() = user_id);

-- ---- A profile row for every new account -------------------------------------

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---- Display names -----------------------------------------------------------
-- The same check as src/lib/names.ts. Keep the two word lists the same.

create or replace function public.clean_name() returns trigger
language plpgsql set search_path = '' as $$
declare
  plain text := translate(lower(trim(new.display_name)), '013457@$!8', 'oieastasib');
  squeezed text := regexp_replace(regexp_replace(plain, '[^a-z]', '', 'g'), '(.)\1+', '\1', 'g');
begin
  new.display_name := trim(new.display_name);
  if char_length(new.display_name) not between 2 and 20 or new.display_name !~ '^[[:alnum:] ._-]+$' then
    raise exception 'Use 2 to 20 letters, numbers, spaces, dots, dashes or underscores.';
  end if;
  -- squeezed has repeated letters collapsed, so the words are written that way here.
  if squeezed ~ '(fuck|shit|bitch|cunt|niger|niga|fagot|retard|whore|slut|ashole|pusy|penis|vagina|porn|nazi|hitler|bastard|jiz|dildo|molest|suicide)'
     or plain ~ '(^|[^a-z])(kkk|ass|dick|cock|rape|pedo|wank|sex|fag|cum|tit|tits|hoe|admin|moderator|mod|staff|official|instructor|support)($|[^a-z])' then
    raise exception 'Pick a different name. That one is not allowed.';
  end if;
  return new;
end $$;
drop trigger if exists profiles_clean_name on public.profiles;
create trigger profiles_clean_name before insert or update of display_name on public.profiles for each row execute function public.clean_name();

-- ---- XP ----------------------------------------------------------------------
-- The app sends what happened (a kind, a day, a quiz score). It never sends points.
-- Mirrors src/lib/xp.ts: the same values and the same caps.
-- shortcut: a quiz score is still the app's word, since the questions are marked on the device.
-- The caps bound what a tampered app can claim: about 345 XP a day. Move marking to the server if XP ever buys anything.

create or replace function public.award_xp(p_id uuid, p_kind text, p_day date, p_score numeric default null, p_n integer default null) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  pts integer := 0;
  cap integer;
  s numeric := least(1, greatest(0, coalesce(p_score, 0)));
  found_pts integer;
  found_user uuid;
begin
  if uid is null then raise exception 'Sign in first.'; end if;

  -- The same event sent twice (a retry after a dropped connection) pays once.
  select e.pts, e.user_id into found_pts, found_user from public.xp_events e where e.id = p_id;
  if found then return case when found_user = uid then found_pts else 0 end; end if;

  -- One writer at a time per cadet, so two requests cannot both slip under a cap.
  perform 1 from public.profiles p where p.id = uid for update;

  pts := case p_kind
    when 'lesson' then 10
    when 'review' then 5
    when 'placement' then 50
    when 'goal' then 20
    when 'streak' then case p_n when 7 then 50 when 30 then 150 when 100 then 500 else 0 end
    when 'quiz' then case when s < 0.7 then 0 else 10 + round(s * 10)::integer + case when s = 1 then 10 else 0 end end
    else null end;
  if pts is null then raise exception 'Unknown activity.'; end if;

  -- No future days, and nothing older than 60 days (guest progress merged at sign-up can be that old).
  if p_day > current_date + 1 or p_day < current_date - 60 then pts := 0; end if;

  if p_kind = 'placement' then
    if exists (select 1 from public.xp_events e where e.user_id = uid and e.kind = 'placement' and e.pts > 0) then pts := 0; end if;
  elsif p_kind = 'streak' then
    if exists (select 1 from public.xp_events e where e.user_id = uid and e.kind = 'streak' and e.n = p_n and e.pts > 0)
       -- The streak must be real: XP earned on each of the n days ending on p_day.
       or (select count(distinct e.day) from public.xp_events e where e.user_id = uid and e.pts > 0 and e.kind <> 'streak' and e.day between p_day - (p_n - 1) and p_day) < p_n then
      pts := 0;
    end if;
  else
    cap := case p_kind when 'goal' then 1 else 5 end;
    if (select count(*) from public.xp_events e where e.user_id = uid and e.kind = p_kind and e.day = p_day and e.pts > 0) >= cap then pts := 0; end if;
  end if;

  insert into public.xp_events (id, user_id, kind, day, pts, score, n) values (p_id, uid, p_kind, p_day, pts, case when p_kind = 'quiz' then s end, p_n);
  update public.profiles set xp = xp + pts where id = uid;
  return pts;
end $$;
revoke all on function public.award_xp(uuid, text, date, numeric, integer) from public, anon;
grant execute on function public.award_xp(uuid, text, date, numeric, integer) to authenticated;

-- ---- Account deletion --------------------------------------------------------
-- Removes the sign-in record; the profile, progress and XP rows go with it (on delete cascade).

create or replace function public.delete_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
