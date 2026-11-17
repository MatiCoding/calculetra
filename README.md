<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/brand/logo/svg/calculetra-horizontal-white.svg">
  <img src="docs/brand/logo/svg/calculetra-horizontal-color.svg" alt="Calculetra" width="420">
</picture>

**Un reto de números y otro de letras cada día.**

A daily numbers-and-letters puzzle inspired by the Spanish TV show *Cifras y Letras*. Every day there is a new challenge, the same for everyone.

[![CI](https://github.com/MatiCoding/calculetra/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/MatiCoding/calculetra/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://calculetra.maticoding.workers.dev)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue)](LICENSE)
[![Docs](https://github.com/MatiCoding/calculetra/actions/workflows/docs.yml/badge.svg?branch=main)](https://maticoding.github.io/calculetra/)

**[Play it](https://calculetra.maticoding.workers.dev)** · [Rules](docs/rules/cifras.md) · [Getting started](#getting-started) · [Documentation](https://maticoding.github.io/calculetra/) · [Contributing](CONTRIBUTING.md)

</div>

## What you can play

> Work in progress. Both games are playable; saving results is the next big step.

| Feature | Status |
| --- | --- |
| **Cifras** (numbers): six numbers and a target every day, with a tree of your operations | ✅ Playable |
| **Letras** (letters): nine letters every day to build the longest word | ✅ Playable |
| **Hints** in both games: up to 3 a day, for a few points | ✅ Playable |
| **Home page**: a carousel with the games (a list on phones) | ✅ Available |
| **Accounts**: email and password, or Google and GitHub; an account page to change your password or email and to delete the account | ✅ Available |
| Saving your results, daily leaderboard and personal stats | 🗓️ Planned |
| **More games**: new daily mini-games, coming to the "Más retos" card on the home page | 🗓️ Planned |

You can play without an account. For now an account does not save your results yet.

## How to play

### Cifras

You get six numbers and a target between 101 and 999. Combine the numbers with `+`, `−`, `×` and `÷` to reach the target, or get as close as you can. The closer you get, the more points you score.

Every operation goes into a tree under the board, so you can see how you got there. Tap a result in the tree to undo that branch, or swap a starting number for a free one and the operations that depend on it are calculated again.

The full rules (how the challenge is generated, which operations are allowed and the score table) are in [`docs/rules/cifras.md`](docs/rules/cifras.md).

### Letras

You get nine letters (between three and five of them vowels). Build the longest Spanish word you can with them: each letter can be used once, and the word needs at least three letters. Accents do not matter. You only get one answer: if the word is in the dictionary you score one point per letter, and a word with all nine letters scores 18. If it is not, you score 0.

You can click the letters or type them, delete with Backspace and send with Enter. The full rules are in [`docs/rules/letras.md`](docs/rules/letras.md), and the dictionary is explained in [ADR 0008](docs/decisions/0008-letras-dictionary.md).

### Hints

Stuck? Both games have a **Pista** button. In Cifras it does the next operation of a solution; in Letras it puts a letter of the longest word in its place. You can use up to 3 hints a day, and they cost 1, 2 and 3 points. **Quitar pistas** / **Ver pistas** takes them off the board or puts them back without paying again.

## Brand

<img src="docs/brand/logo/svg/calculetra-symbol-color.svg" alt="" width="72" align="right">

The logo is a letter tile and a number coin leaning on each other: the two games side by side. The tile carries the C and the coin the L, for *Calcu* and *letra*.

| Colour | Hex | Used for |
| --- | --- | --- |
| Letter blue | `#1E5AA8` | Letras, links and focus |
| Number orange | `#E8A317` | Cifras and the number coins |
| Cream | `#F4F1EA` | Page background |
| Ink | `#1F2430` | Text and the one colour logo |

Blue always means Letras and orange always means Cifras. The logo and the game tiles use [Inter](https://rsms.me/inter/); the rest of the interface uses the system font.

Everything else (logo variants, clear space, typography, tiles and tone of voice) is in the **[brand guidelines](docs/brand/calculetra-brand-guidelines.pdf)**. The logo files, in SVG and PNG, are in [`docs/brand/logo/`](docs/brand/logo).

## Tech stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org), with [React Router](https://reactrouter.com) for the pages
- [Vite](https://vite.dev) for development and builds
- [Supabase](https://supabase.com) for accounts (see [why Supabase](docs/decisions/0001-backend-supabase.md))
- [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com) for tests
- [ESLint](https://eslint.org) for linting
- [GitHub Actions](https://github.com/features/actions) for CI
- [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) for hosting (see [why Cloudflare](docs/decisions/0010-hosting-cloudflare.md))

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 24 or later (it comes with npm). Check your version with `node -v`.
- [Git](https://git-scm.com).
- A [Supabase](https://supabase.com) project (the free plan is enough), only if you want to run the app locally. See [step 3](#3-set-up-the-environment-variables).

### 1. Clone the repository

```bash
git clone https://github.com/MatiCoding/calculetra.git
cd calculetra
```

### 2. Install the dependencies

```bash
npm ci
```

This installs the exact versions listed in `package-lock.json` into a `node_modules` folder. That folder is not committed, so you need to run this after every fresh clone. If you get an error like `'eslint' is not recognized` or `vite: command not found`, you probably skipped this step.

### 3. Set up the environment variables

The app reads its configuration from a `.env` file that is not committed. Create it from the example:

```bash
cp .env.example .env
```

(In Windows PowerShell: `Copy-Item .env.example .env`.)

Then fill in the values:

| Variable | What it is | If it is empty |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | The URL of your Supabase project (in its project settings) | The app does not start: the page is blank and the browser console shows `Missing environment variable VITE_SUPABASE_URL`. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The publishable key of your Supabase project | Same as above, with `VITE_SUPABASE_PUBLISHABLE_KEY`. |
| `VITE_UNDER_CONSTRUCTION` | Feature flag. Set it to `true` to show only the "under construction" page instead of the app | The flag is off and the app is shown. Only the exact value `true` turns it on. |

Without the Supabase keys you cannot run the app, but `npm run lint`, `npm test` and `npm run build` still work, because the tests do not talk to Supabase. See [Working without Supabase keys](CONTRIBUTING.md#working-without-supabase-keys).

Use only the **publishable** key. The secret key must never go in this file: every `VITE_` variable ends up in the JavaScript that the browser downloads.

### 4. Run the app locally

```bash
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173). The page reloads automatically when you save a file. Press `Ctrl + C` in the terminal to stop the server.

If you change `.env`, stop the server and start it again: Vite only reads it when it starts.

### 5. Run the tests

```bash
npm test
```

This runs every test file once and shows which tests passed or failed. While you are coding, `npm run test:watch` keeps running and re-runs the tests every time you save.

### 6. Check your changes before pushing

CI runs these same checks as four separate jobs on every push to `developer` and on every pull request, so running them locally first saves you a red build:

```bash
npm run lint       # looks for common mistakes and bad practices
npm test           # runs the tests
npm run build      # checks the types and builds the production version into dist/
npm run docs:build # builds the documentation site and fails on broken links
```

### Available scripts

<details>
<summary>Every <code>npm run</code> command</summary>

| Command                | What it does                                              |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Starts the development server with live reload            |
| `npm run words`        | Builds the Letras dictionary (`public/letras/words.txt`); `dev` and `build` run it first |
| `npm test`             | Runs the tests once                                       |
| `npm run test:watch`   | Runs the tests and re-runs them on every change           |
| `npm run lint`         | Runs ESLint                                               |
| `npm run build`        | Type-checks and builds for production                     |
| `npm run preview`      | Serves the production build locally                       |
| `npm run docs:dev`     | Starts the documentation site with live reload            |
| `npm run docs:build`   | Builds the documentation site into `docs/.vitepress/dist` |
| `npm run docs:preview` | Serves the built documentation site locally               |

</details>

## Project structure

```
src/
├── domain/          # game logic in plain TypeScript, no React
│   ├── cifras/      #   Cifras: challenge, operations, game state, tree, solver, hints, score
│   ├── letras/      #   Letras: daily letters, word checks, dictionary, game state, score, hints
│   └── shared/      #   seeded random and the date in Madrid, used by both games
├── auth/            # accounts; the only folder that knows about Supabase
│   ├── api/         #   Supabase client and calls
│   ├── context/     #   AuthProvider and the useAuth hook
│   ├── signUp/      #   sign up validation and error messages
│   ├── logIn/       #   log in error messages
│   ├── oauth/       #   coming back from Google or GitHub
│   ├── password/    #   new password validation and error messages
│   └── email/       #   new email validation and error messages
├── components/      # React components, one folder each (Name.tsx, Name.test.tsx, Name.module.css)
├── config/          # feature flags
├── hooks/           # React hooks shared by several components
├── test/            # fakes shared by the tests
├── App.tsx          # pages: / (games), /cifras, /letras, log in and sign up, the account pages, /privacy and the 404 page
├── Root.tsx         # router, AuthProvider and the "under construction" flag
├── main.tsx         # entry point
└── index.css        # global styles and colour tokens
public/              # icons, link preview image and security headers
scripts/             # builds the Letras dictionary
supabase/            # database migrations and the account email templates
tests/               # tests that build the whole app
docs/                # game rules, architecture, decisions and brand
.github/             # CI and deploy workflows, issue forms and pull request template
wrangler.jsonc       # Cloudflare Workers configuration
```

Game logic lives in `src/domain` and is kept separate from the UI, so it can be tested on its own. The [architecture document](docs/architecture.md#5-building-blocks) explains how these folders depend on each other.

## Documentation

The documentation is published at **[maticoding.github.io/calculetra](https://maticoding.github.io/calculetra/)**, with search and a sidebar. The same Markdown files live in [`docs/`](docs), so you can also read them here:

- [Cifras rules](docs/rules/cifras.md): how the game works, with a worked example.
- [Letras rules](docs/rules/letras.md): how the game works, with a worked example.
- [Architecture](docs/architecture.md): how the app is built and why, with diagrams.
- [Architecture decisions](docs/decisions/README.md): the ADRs, the record of each important technical decision and its reasons.
- [Brand guidelines](docs/brand/calculetra-brand-guidelines.pdf): the logo, colours, fonts, tiles and tone of voice.
- [Contributing guide](CONTRIBUTING.md): how to propose a change.
- [Changelog](CHANGELOG.md): what changed in each version.

## Contributing

Contributions are welcome. Read the [contributing guide](CONTRIBUTING.md) before you start. In short:

- `main` only receives changes that are ready to be published. Production is the latest published release, deployed when the release is published.
- `developer` is where changes are integrated. Fork the repository, create a branch from `developer` and open a pull request to `developer`.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`…).
- Lint, tests and build must pass, locally and in CI.

The maintainer pushes small changes directly to `developer`. That shortcut is only for the maintainer: everyone else follows the pull request workflow in the [contributing guide](CONTRIBUTING.md).

Work is tracked with [GitHub issues](https://github.com/MatiCoding/calculetra/issues) and [milestones](https://github.com/MatiCoding/calculetra/milestones).

## License

Calculetra is free software under the [GNU General Public License v3.0](LICENSE).
