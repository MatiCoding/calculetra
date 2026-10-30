<div align="center">

# Calculetra

A daily numbers-and-letters puzzle inspired by the Spanish TV show *Cifras y Letras*. Every day there is a new challenge, the same for everyone.

[![CI](https://github.com/MatiCoding/calculetra/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/MatiCoding/calculetra/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-deployed-000000?logo=vercel&logoColor=white)](https://calculetra.vercel.app)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue)](LICENSE)
[![Docs](https://github.com/MatiCoding/calculetra/actions/workflows/docs.yml/badge.svg?branch=main)](https://maticoding.github.io/calculetra/)

**[Play it](https://calculetra.vercel.app)** · [Rules](docs/rules/cifras.md) · [Getting started](#getting-started) · [Documentation](https://maticoding.github.io/calculetra/) · [Contributing](CONTRIBUTING.md)

</div>

## Status

>Work in progress. The numbers mode is playable; the letters mode is not built yet.

| Feature | Status |
| --- | --- |
| **Cifras** (numbers): a new challenge every day, with undo, reset and a score | ✅ Playable |
| **Accounts**: sign up, log in and log out with email and password | ✅ Available |
| Saving your results, daily leaderboard and personal stats | 🗓️ Planned |
| **Letras** (letters): nine new letters every day to build the longest word | ✅ Playable |

You can play without an account. For now an account only lets you log in: results are not saved yet.

## How to play

### Cifras

You get six numbers and a target between 101 and 999. Combine the numbers with `+`, `−`, `×` and `÷` to reach the target, or get as close as you can. The closer you get, the more points you score.

The full rules (how the challenge is generated, which operations are allowed and the score table) are in [`docs/rules/cifras.md`](docs/rules/cifras.md).

### Letras

You get nine letters (between three and five of them vowels). Build the longest Spanish word you can with them: each letter can be used once, and the word needs at least three letters. Accents do not matter. You only get one answer: if the word is in the dictionary you score one point per letter, and a word with all nine letters scores 18. If it is not, you score 0.

You can click the letters or type them, delete with Backspace and send with Enter. The dictionary is explained in [ADR 0008](docs/decisions/0008-letras-dictionary.md).

## Tech stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org), with [React Router](https://reactrouter.com) for the pages
- [Vite](https://vite.dev) for development and builds
- [Supabase](https://supabase.com) for accounts (see [why Supabase](docs/decisions/0001-backend-supabase.md))
- [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com) for tests
- [ESLint](https://eslint.org) for linting
- [GitHub Actions](https://github.com/features/actions) for CI
- [Vercel](https://vercel.com) for hosting

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

## Project structure

```
src/
├── domain/          # game logic in plain TypeScript, no React
│   ├── cifras/      #   Cifras: challenge, operations, game state, score
│   ├── letras/      #   Letras: daily letters, word checks, dictionary, game state, score
│   └── shared/      #   seeded random and the date in Madrid, used by both games
├── auth/            # accounts; the only folder that knows about Supabase
│   ├── api/         #   Supabase client and calls (sign up, log in, log out)
│   ├── context/     #   AuthProvider and the useAuth hook
│   ├── signUp/      #   sign up validation and error messages
│   └── logIn/       #   log in error messages
├── components/      # React components, one folder each (Name.tsx, Name.test.tsx, Name.module.css)
├── config/          # feature flags
├── hooks/           # React hooks shared by several components
├── App.tsx          # pages: / (game carousel), /cifras, /letras, the account pages and the 404 page
├── Root.tsx         # router, AuthProvider and the "under construction" flag
├── main.tsx         # entry point
└── index.css        # global styles and colour tokens
tests/               # tests that build the whole app
docs/                # game rules, architecture and decisions
.github/             # CI workflow, issue forms and pull request template
```

Game logic lives in `src/domain` and is kept separate from the UI, so it can be tested on its own. The [architecture document](docs/architecture.md#5-building-blocks) explains how these folders depend on each other.

## Documentation

The documentation is published at **[maticoding.github.io/calculetra](https://maticoding.github.io/calculetra/)**, with search and a sidebar. The same Markdown files live in [`docs/`](docs), so you can also read them here:

- [Cifras rules](docs/rules/cifras.md): how the game works, with a worked example.
- [Architecture](docs/architecture.md): how the app is built and why, with diagrams.
- [Architecture decisions](docs/decisions/README.md): the ADRs, the record of each important technical decision and its reasons.
- [Contributing guide](CONTRIBUTING.md): how to propose a change.

## Contributing

Contributions are welcome. Read the [contributing guide](CONTRIBUTING.md) before you start. In short:

- `main` only receives changes that are ready to be published. Production is the latest published release, deployed when the release is published.
- `developer` is where changes are integrated. Fork the repository, create a branch from `developer` and open a pull request to `developer`.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`…).
- Lint, tests and build must pass, locally and in CI.

The maintainer pushes small changes directly to `developer`. That shortcut is only for the maintainer: everyone else follows the pull request workflow in the [contributing guide](CONTRIBUTING.md).

Work is tracked with [GitHub issues](https://github.com/MatiCoding/calculetra/issues) and [milestones](https://github.com/MatiCoding/calculetra/milestones).

## License

See [LICENSE](LICENSE).
