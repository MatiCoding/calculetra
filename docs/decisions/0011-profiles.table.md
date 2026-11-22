# 11. Keep nicknames and avatars in a profiles table

- Status: Accepted
- Date: 2026-11-22

## Context

[Issue #87](https://github.com/MatiCoding/calculetra/issues/87) gives every player a nickname and an avatar. Later, other players will see them: in the header, and in the leaderboard and stats that are planned. So:

- Other logged-in players must be able to read someone's nickname and avatar, but only the owner can change them.
- Nicknames must be unique, without telling capital letters apart (`Mateo` and `mateo` are the same nickname).
- Every account needs a nickname from the start, also the accounts that existed before this change.

Supabase Auth already lets each user keep their own data in `user_metadata`, but only the user can read it, and the database cannot check that a value is unique there.

## Decision

Keep the profile in its own table, `public.profiles`, with one row per user.

- `id` is the user's id and references `auth.users(id)` with `on delete cascade`, so deleting the account deletes the profile ([ADR 0006](0006-delete-account.md)).
- Columns: `nickname`, and for the avatar `tile_kind` (`thumb` or `text`), `tile_text`, `thumb_expression`, `thumb_color`, `tile_color`, `tile_style` (`flat` or `outline`) and `updated_at`.
- The database checks the rules too, not only the app: check constraints for the nickname (3 to 20 letters, numbers or `_`), the text (up to 3 letters or numbers) and the allowed values, a check so the character and the background are not the same colour, and a unique index on `lower(nickname)`.
- Row Level Security: every logged-in user can read every profile; a user can only update their own row, and only the columns of the nickname and the avatar. Nobody can insert or delete rows from the browser, and `anon` has no access.
- A trigger on `auth.users` creates the profile when an account is created, with a free nickname `player_` plus 4 digits (more digits if they run out). The migration gives a profile to the accounts that already existed.
- The SQL is in `supabase/migrations/` and is run by hand in the Supabase SQL Editor, like `delete_account()`.
- The app reads and writes profiles only through `src/profile/api`. Components never call Supabase for profiles, so the storage can change (for example with the hosting, [ADR 0010](0010-hosting-cloudflare.md)) without touching them.

The avatar is drawn in the browser from those columns: a Thumbs character from [DiceBear](https://www.dicebear.com) (CC0, no credit needed) or 1 to 3 letters, on a colour of our own palette. No image is stored.

## Alternatives considered

- **`user_metadata` in Supabase Auth**: no new table, but other players cannot read it, so nicknames could not be shown in a leaderboard, and uniqueness could not be checked by the database.
- **Photos from Google or GitHub**: dropped for privacy. The photo is linked to the player's real account, and a player could show it without realising. It may come back later, as something the player turns on.
- **Uploading an avatar image**: needs storage, size limits and moderation. Not worth it yet.

## Consequences

- Nicknames and avatars are public to every logged-in player. The Perfil tab must not ask for anything private.
- Two people can pick the same free nickname at the same time: the app checks it while typing, but the unique index has the last word, and `updateProfile` turns that error (`23505`) into `NicknameTakenError`.
- The migration has to be run in every Supabase project. Without it, the Perfil tab cannot load the profile.
- Every new avatar option needs a new column (or allowed value) in a migration, its check constraint and its column in the `grant update`. The accessories issue will be the first one.
