# 10. Host the app on Cloudflare Workers

- Status: Accepted
- Date: 2026-11-17

## Context

Calculetra is a static React app (a Vite build in `dist/`) with no server of its own. Accounts and data are on Supabase ([ADR 0001](0001-backend-supabase.md)). Until now it was hosted on Vercel, deployed by a GitHub workflow when a release is published ([ADR 0003](0003-deploy-on-release.md)).

[Issue #86](https://github.com/MatiCoding/calculetra/issues/86) moves the hosting away from Vercel:

- Vercel's free (Hobby) plan does not allow commercial use and limits bandwidth. Cloudflare's free plan allows both.
- Calculetra should look and run like a real product, not like a default template project.
- There are no real players before v1.0.0, so this is the cheapest moment to change the URL.
- If accounts and data move to Cloudflare later (D1), the hosting is already there.

## Decision

- The app is deployed as a **Cloudflare Worker with static assets**. There is no Worker code: only configuration in `wrangler.jsonc`.
- `assets.directory` is `./dist`, the output of `npm run build`.
- `assets.not_found_handling` is `single-page-application`: a path with no file, such as `/account`, gets `index.html` and React Router shows the page. An unknown path, such as `/patata`, also gets `index.html`, and the router shows the 404 page.
- The security headers ([ADR 0004](0004-session-storage.md)) are in `public/_headers`. Vite copies it to `dist/` and Cloudflare applies it to every response. `tests/security-headers.test.ts` reads that file.
- The **Deploy** workflow keeps the rules of ADR 0003 (deploy on a published release, skip pre-releases, manual run with a tag). It runs `npm ci`, `npm run build` and `npx wrangler deploy`.
- The build reads `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_UNDER_CONSTRUCTION` from GitHub repository **variables**. They end up in the public bundle, so they are not secrets.
- Wrangler logs in with two repository **secrets**: `CLOUDFLARE_API_TOKEN` (created from the "Edit Cloudflare Workers" template) and `CLOUDFLARE_ACCOUNT_ID`.
- Wrangler is a dev dependency, so the workflow and every developer use the same version.
- The site runs on `https://calculetra.maticoding.workers.dev` until Calculetra has its own domain.

This ADR supersedes ADR 0003. The rules about when to deploy are the same; only the hosting and the tools change.

## Alternatives considered

- **Stay on Vercel**: no work, but the Hobby plan does not allow commercial use.
- **Cloudflare Pages**: also free and simple, but Cloudflare now recommends Workers with static assets for new projects, and new features go there first.
- **Netlify**: similar to Vercel, with the same kind of free plan limits.
- **GitHub Pages**: already hosts the documentation, but it cannot set response headers (no CSP) and has no fallback to `index.html` for routes like `/account`.

## Consequences

- `npm run dev` does not need Wrangler. The headers in `_headers` only apply on Cloudflare, so they have to be checked on the deployed site.
- There are no preview deployments of each branch, as there were on Vercel. A change can be checked before a release with `npx wrangler versions upload` from a local build: it uploads a version with its own preview URL and does not change production.
- Rolling back is still running the Deploy workflow with an older tag. Tags up to v0.7.0 have no `wrangler.jsonc`, so they cannot be deployed to Cloudflare. In the Cloudflare dashboard, **Deployments** can also roll back to an earlier upload.
- The Cloudflare API token must be renewed in Cloudflare and in the `CLOUDFLARE_API_TOKEN` secret if it expires or is revoked.
- The site URL changed. The Site URL and redirect URLs in Supabase, the GitHub OAuth app and the Google OAuth client point to the new URL. They must be changed again when Calculetra gets its own domain.
