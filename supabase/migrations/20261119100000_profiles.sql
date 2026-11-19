create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,

  nickname text not null
    check (nickname ~ '^[A-Za-z0-9_ÁÉÍÓÚÜÑáéíóúüñ]{3,20}$'),   

  tile_kind text not null default 'thumb'
    check (tile_kind in ('thumb', 'text')),

  tile_text text not null default ''
    check (tile_text ~ '^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ]{0,3}$'),

  thumb_expression text not null default 'happy'
    check (thumb_expression in ('happy', 'laugh', 'in_love', 'calm', 'wink', 'kiss', 'excited', 'cool')),

  thumb_color text not null default 'mustard'
    check (thumb_color in ('mustard', 'blue', 'brick', 'green', 'teal', 'plum', 'coral', 'ink')),

  tile_color text not null default 'blue'
    check (tile_color in ('mustard', 'blue', 'brick', 'green', 'teal', 'plum', 'coral', 'ink')),

  tile_style text not null default 'flat'
    check (tile_style in ('flat', 'outline')),

  updated_at timestamptz not null default now(),

  constraint thumb_visible check (thumb_color != tile_color)
);

create unique index profiles_nickname_unique on public.profiles (lower(nickname));

-- Row Level Security: without a policy that allows it, nobody can do anything.
alter table public.profiles enable row level security;

-- Anyone signed in can read profiles (header, rankings...).
create policy "Signed-in users can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- A user can only change their own row, and cannot give it someone else's id.
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Supabase lets the browser key write to every column of new tables.
-- Only these columns can be changed from the app: id and photo_url cannot.
-- Rows are only created by the trigger and deleted with the account.
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant update (nickname, tile_kind, tile_text, thumb_expression,
              thumb_color, tile_color, tile_style, updated_at)
  on public.profiles to authenticated;

-- Creates the profile of every new user (email, Google or GitHub), with a
-- free nickname like player_4821, so nobody is ever without a profile.
create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
-- Runs with the rights of its owner: the new user cannot insert into profiles.
security definer
set search_path = ''
as $$
declare
  digits int := 4;
  attempts int := 0;
  candidate text;
begin
  loop
    candidate := 'player_' || lpad(floor(random() * power(10, digits))::bigint::text, digits, '0');
    begin
      insert into public.profiles (id, nickname) values (new.id, candidate);
      return new;
    exception when unique_violation then
      -- Taken: try another number. Every 10 tries, use one more digit (at most 13, so the nickname is never longer than 20).
      attempts := attempts + 1;
      if attempts % 10 = 0 and digits < 13 then
        digits := digits + 1;
      end if;
    end;
  end loop;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

-- Users created before this migration get a profile too, each with a
-- different random player_NNNN. The table is empty at this point, so
-- every number is free: we shuffle the 10,000 numbers and give one to
-- each user. (Enough while there are fewer than 10,000 users.)
insert into public.profiles (id, nickname)
select users.id, 'player_' || lpad(numbers.n::text, 4, '0')
from (
  select u.id, row_number() over () as position
  from auth.users u
  where not exists (select 1 from public.profiles p where p.id = u.id)
) as users
join (
  select n, row_number() over (order by random()) as position
  from generate_series(0, 9999) as n
) as numbers using (position);