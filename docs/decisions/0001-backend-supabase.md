
# 1. Use Supabase as the backend

- Status: Accepted
- Date: 2026-10-10

## Context

Calculetra is a static React app deployed on Vercel. Milestone 2 needs a backend for:

- User accounts: sign up, log in, log out and password reset.
- Saving each player's results, one row per game.
- A daily leaderboard and personal stats.

The project is maintained by one student, so the backend has to be free for a small project, quick to set up and usable from the frontend without writing a custom server.

## Decision

Use [Supabase](https://supabase.com) for authentication and data storage.

- Accounts are handled by Supabase Auth (email and password). Users are stored in its own `auth.users` table, so the app never stores passwords.
- Game data will go in our own PostgreSQL tables in the same project, linked to users through a `user_id` column.
- The app talks to Supabase with `@supabase/supabase-js`, wrapped in `src/auth/` so components never call the provider directly.

## Alternatives considered

- **Firebase**: also offers auth and a free plan, but its database (Firestore) is not relational. A daily leaderboard and stats such as averages are simple SQL queries in Postgres and harder to model in Firestore.
- **Own backend** (for example Node.js with a database): full control, but much more work to build, host and secure, and it is not needed at this stage.

## Consequences

- The project URL and the public (publishable) key are shipped in the browser bundle. This is expected: data is protected by **Row Level Security** policies in the database, which must be enabled on every table we create.
- The secret key (`service_role`) must never be used in the frontend or committed to the repository.
- The keys are read from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, set in a local `.env` and in Vercel (Production and Preview).
- On the free plan, projects are paused after a period of inactivity and have usage limits. That is acceptable for now.
- Because the provider is wrapped in `src/auth/`, switching to another provider later would only require changes in that folder.
