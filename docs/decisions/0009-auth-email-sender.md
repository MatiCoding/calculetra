# 9. Send auth emails through Gmail SMTP

- Status: Accepted
- Date: 2026-11-05

## Context

[Issue #52](https://github.com/MatiCoding/calculetra/issues/52) customizes the emails that Supabase Auth sends for accounts: confirm sign up, reset password and change email. Until now they were Supabase's defaults, in English and from a generic sender.

Supabase's built-in email service is meant only for trying things out:

- It only sends to the email addresses of the members of the Supabase project team. Real players never get their emails.
- It sends very few emails per hour (about 2), shared by every kind of auth email.
- The sender is a Supabase address, so players do not recognise it.
- The email templates cannot be changed while it is in use.

So Calculetra needs its own SMTP provider. We do not own a domain yet: the site runs on the Vercel domain.

## Decision

**Supabase sends the auth emails through Gmail's SMTP server**, from `calculetra.game@gmail.com`, a Google account created only for the game's communications, using an app password:

- Host `smtp.gmail.com`, port `465`, sender `Calculetra <calculetra.game@gmail.com>`.
- The app password is only saved in the Supabase dashboard (*Authentication → Emails → SMTP Settings*). It is never committed to the repository.
- The rate limit for emails in Supabase (*Authentication → Rate Limits*) is 20 emails an hour (480 a day), below Gmail's daily limit (about 500), so a bot asking for many emails cannot get the account blocked.

How to set it up is in [CONTRIBUTING](../../CONTRIBUTING.md#auth-emails).

## Alternatives considered

- **The maintainer's personal Gmail**: works the same, but it shows a personal address to every player and mixes the game's emails with personal ones.
- **Supabase's built-in service**: free and already set up, but it only reaches the team and does not let us change the templates.
- **Resend, Brevo or a similar provider with our own domain**: better deliverability and an address like `no-reply@calculetra.xx`, but it needs buying a domain and setting up DNS records (SPF, DKIM). Too much for the number of players we have now.
- **One of those providers without a domain**: they either only send to our own address or the emails fail the checks of Gmail and Outlook and end up in spam.

## Consequences

- Real players receive the emails, in Spanish and with the Calculetra name.
- The sender is a game account, not the maintainer's personal one, so players never see a personal address and the account can be handed over to someone else.
- Gmail limits sending to about 500 emails a day and can block the account if it looks like spam. If the game grows, we move to a provider with our own domain and update this ADR.
- If the Gmail password changes or the app password is revoked, the emails stop. Supabase shows the error in *Logs → Auth*.
