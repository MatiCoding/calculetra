# 6. Delete accounts with a database function

- Status: Accepted
- Date: 2026-10-24

## Context

[Issue #51](https://github.com/MatiCoding/calculetra/issues/51) lets a logged-in player delete their account from the account page. Players should be able to leave and take their data with them without asking the maintainer, and privacy rules such as the GDPR (right to erasure) expect it.

Calculetra is a static app with no server of its own ([ADR 0001](0001-backend-supabase.md)). The browser only has the publishable key, and Supabase does not let that key delete users: `auth.admin.deleteUser()` needs the secret (service role) key, which must never be in the frontend or in the repository. So the deletion has to run on the Supabase side.

## Decision

Delete the account with a Postgres function in the Supabase database, `public.delete_account()`, called from the browser with `supabase.rpc('delete_account')`.

- The function is `security definer`: it runs with the rights of its owner, who can delete rows from `auth.users`.
- It deletes only `auth.uid()`, the user of the access token that calls it. A user can delete themselves and nobody else, and there is no parameter to tamper with.
- `execute` is revoked from `anon` and `public` and granted only to `authenticated`.
- It uses an empty `search_path`, as Supabase recommends for `security definer` functions.
- Sessions, refresh tokens and identities are deleted with the user by the foreign keys of the `auth` schema (`on delete cascade`).
- After the call, the app goes to the home page and then logs out with the usual `logOut()`, which removes the session stored in the browser. Supabase answers that the session no longer exists, and `supabase-js` ignores that answer and removes the local session anyway.
- The SQL lives in `supabase/migrations/` so it is reviewed and versioned like the rest of the code. For now it is run by hand in the SQL Editor of the Supabase dashboard, because the project does not use the Supabase CLI yet.

In the app, the user has to type their email to confirm, so the account cannot be deleted with one click by accident.

### Saved results and leaderboard

They do not exist yet. When they are added, their tables must reference `auth.users(id)` with `on delete cascade`, so a deleted account takes its results and leaderboard entries with it. Nothing is kept anonymised.

## Alternatives considered

- **Edge Function with the service role key**: the official way (`auth.admin.deleteUser()`), with the key stored as a secret in Supabase. It adds a new runtime (Deno), its own deploy and CORS for a single call. Worth revisiting if more server-side logic appears.
- **A server of our own**: Calculetra has none, and adding one only for this is not worth it.
- **Asking the maintainer to delete the account**: manual, slow, and the issue asks for players to do it themselves.
- **Disabling the account instead of deleting it**: the data would stay, which is not what the right to erasure asks for.

## Consequences

- No secret key is needed anywhere: the browser keeps using the publishable key.
- The function has to be created in each Supabase project (now only production) by running the SQL file. If it is missing, deleting fails with an error and nothing is deleted.
- Anyone with a valid access token of a user can delete that account: typing the email only protects against accidents, not against a stolen token. This is accepted because access tokens live 15 minutes and are hard to steal ([ADR 0004](0004-session-storage.md)). Asking for the password again before deleting would be a possible improvement.
- After deleting, the access token still looks valid until it expires, but the user no longer exists, so `getUser()` and refreshing the session fail.
- Every new table with user data must remember `on delete cascade`.