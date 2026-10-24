-- Lets a logged-in user delete their own account (issue #51, ADR 0006).
--
-- The browser key cannot delete users, so the app calls this function with
-- supabase.rpc('delete_account'). "security definer" runs it with the rights
-- of its owner (postgres), who can delete from auth.users. auth.uid() is the
-- user of the access token, so a user can only ever delete themselves.
create or replace function public.delete_account()
returns void
language plpgsql
security definer
-- Empty search_path so nobody can make the function use another "auth" schema.
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not logged in' using errcode = '42501';
  end if;

  -- Sessions, refresh tokens and identities are deleted with the user
  -- (on delete cascade). Future tables with user data must do the same.
  delete from auth.users where id = auth.uid();
end;
$$;

-- Only logged-in users can call it.
revoke execute on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;