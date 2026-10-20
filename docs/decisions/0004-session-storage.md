# 4. Keep the session in localStorage and reduce the risk

- Status: Accepted
- Date: 2026-10-20

## Context

[Issue #38](https://github.com/MatiCoding/calculetra/issues/38) reported that the authentication token is stored in `localStorage`. Copying it into another browser logs that browser in as the same user, without a password.

`supabase-js` stores the session (access token and refresh token) in `localStorage` by default. Any JavaScript running on our page can read it, so a cross-site scripting (XSS) bug or a compromised dependency could steal it and use it somewhere else.

A copied token working in another browser is how bearer tokens work: the server checks that the token is valid, not who sends it. This cannot be fully prevented on the client. What we can do is make the token hard to steal and make a stolen token useful for a short time only.

Calculetra is a static app on Vercel with no server of its own ([ADR 0001](0001-backend-supabase.md)).

## Decision

Keep the session in `localStorage`, which is what Supabase does by default, and reduce the risk with:

- **Content Security Policy and security headers** in `vercel.json`. `script-src 'self'` only runs our own scripts, and `connect-src` only allows requests to our domain and to Supabase, so injected code cannot run or send the token elsewhere. `frame-ancestors 'none'`, `X-Frame-Options`, `X-Content-Type-Options` and `Referrer-Policy` are also set. A test (`tests/security-headers.test.ts`) fails if the policy is removed or weakened.
- **Validating the session with the server on start.** `getCurrentUser()` uses `getUser()` instead of `getSession()`, so a revoked session is not trusted just because it is still stored in the browser. `onAuthChange` ignores the `INITIAL_SESSION` event for the same reason.
- **Signing out from every device.** `logOut()` calls `signOut({ scope: 'global' })`, which revokes the refresh tokens of all the user's sessions.
- **Short-lived access tokens.** The access token expires after 15 minutes (900 seconds) instead of 1 hour. Refresh token rotation with reuse detection is enabled in Supabase.

## Alternatives considered

- **`httpOnly` cookies**: JavaScript cannot read them, which is the usual answer to this problem. But they need a server that sets the cookie and sits between the app and Supabase (a backend for frontend, or server-side rendering with `@supabase/ssr`). Calculetra has no server, so this is an architecture change that is not worth it now. It also does not stop an XSS attack from sending requests from the victim's own browser.
- **`sessionStorage`**: JavaScript can read it too, and the session is lost when the tab is closed. Worse for a daily game.
- **Memory only**: the session is lost on every page reload.

## Consequences

- If an XSS bug got past the CSP, the token could still be read. The CSP makes this much harder and a stolen access token is valid for 15 minutes at most.
- Every new external service (analytics, fonts, images or APIs from another domain) must be added to the CSP, or the browser will block it. On Vercel Preview deployments, the Vercel toolbar is blocked by the CSP; this is expected.
- The CSP headers only apply on Vercel, not with `npm run dev`. They have to be checked on a Preview deployment.
- Opening the app makes one extra request to Supabase to validate the session.
- If Calculetra ever gets its own server, moving the session to `httpOnly` cookies should be reconsidered in a new ADR.
