# 7. One account per email, linked automatically

- Status: Accepted
- Date: 2026-10-25

## Context

[Issue #53](https://github.com/MatiCoding/calculetra/issues/53) lets players sign up and log in with an external account (Google and GitHub for now; Facebook and LinkedIn later) as well as with email and password. So the same person can reach Calculetra in more than one way with the same email:

- They created an account with email and password, and later click "Google" with that email.
- They signed up with GitHub, and later click "Google" with the same email.
- They signed up with Google, and later try to sign up or log in with email and password.

We have to decide if that is one account or several, because results and the leaderboard will hang from the account.

## Decision

**One email is one account.** We keep the default behaviour of Supabase Auth, *automatic identity linking*:

- When someone logs in with a provider and a user with the same email already exists, Supabase adds the provider as a new *identity* of that user instead of creating another one. The player sees the same account, with the same data, whichever way they log in.
- Supabase only links when the provider says that the email is verified. Google and GitHub only give us verified emails.
- Signing up with email and password using an email that already has an account (from a provider or not) fails with the usual "Ya existe una cuenta con este email" error, as before ([`signUp`](../../src/auth/api/auth.ts)).
- A user who only has providers has no password, so logging in with email and password fails with "Correo electrónico o contraseña incorrectos". If they want a password, they can set one with "¿Has olvidado tu contraseña?", which sends the usual reset link.

Nothing has to be built for this: it is Supabase's default. This ADR writes it down so it is a decision and not an accident.

## Alternatives considered

- **One account per identity** (turn automatic linking off): the same person would end up with two accounts, two streaks and two places on the leaderboard, without understanding why. Not what players expect.
- **Ask before linking** ("this email already has an account, log in with your password to link Google"): safer against a provider that lies about emails, but it needs its own screens and flow. Linking and unlinking from the account page is out of scope in #53.
- **Block the provider login** when the email exists: simple, but players would hit an error just for clicking the "wrong" button.

## Consequences

- Each player has a single account and a single history, whatever the login method.
- We trust the providers to verify emails. Supabase protects us by linking only verified emails; a new provider must be checked for this before enabling it.
- Accounts without a password exist now. The account page must handle them (#53: hide or adapt "Cambiar contraseña" and "Cambiar correo").
- Changing the email of an account with providers does not change the email in the provider, so the identities can end up with different emails. This is accepted for now.
- Linking and unlinking providers by hand is left for a later issue.
