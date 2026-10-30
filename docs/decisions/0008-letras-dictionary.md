# 8. Letras dictionary: a generated word list, downloaded only on /letras

- Status: Accepted
- Date: 2026-10-30

## Context

[Issue #68](https://github.com/MatiCoding/calculetra/issues/68) adds Letras: the player builds a word with the nine letters of the day, and the word only scores if it is in the dictionary. So the app needs a list of Spanish words that:

- has a license compatible with the repo (GPL-3.0),
- includes plurals and conjugated verbs (`CHAPELAS`, `CERNISTE`), because players will try them,
- does not slow down the rest of the site: the issue asks to keep it out of the main bundle and load it only on `/letras`.

## Decision

- **Source:** the npm package [`an-array-of-spanish-words`](https://www.npmjs.com/package/an-array-of-spanish-words) (MIT, about 636,000 words, derived from the Letterpress word list). It is a dev dependency: it is only used to build the list.
- **Generated file:** `scripts/build-words.js` normalizes every word the same way as the game (upper case, no accents, the Ñ kept), keeps the ones with 3 to 9 letters and writes `public/letras/words.txt`, one word per line (about 260,000 words, 2.3 MB, around 580 KB compressed). The file is not committed: `npm run dev` and `npm run build` generate it first through the `predev` and `prebuild` scripts.
- **Loading:** `loadDictionary` in `src/domain/letras/dictionaryLetras.ts` downloads the file with `fetch` when `LettersGame` mounts, and turns it into a `Set` so checking a word is instant. Files in `public/` are not part of the JavaScript bundle, so no other page pays for it.

## Alternatives considered

- **`dictionary-es` (the LibreOffice/Hunspell dictionary):** very good and with a compatible license, but it stores roots plus rules to build the other forms. We would have to expand it, which is a project of its own.
- **Committing the generated file:** simpler, but it adds 2.3 MB to the repo every time the list changes, and the source of truth would be hidden.
- **Importing the list in the code (a dynamic `import()`):** also kept out of the main bundle, but the words would become a JavaScript chunk that the browser has to parse, which is slower than reading plain text.
- **Checking words on a server:** no server is needed today (see [ADR 0001](0001-backend-supabase.md)), and players would wait for a request on every answer.

## Consequences

- The dictionary is only as good as the list: it may miss some words or accept odd ones. Changing it means changing the package or the script, not the game.
- Every visit to `/letras` downloads the list (the browser caches it). A smaller list or a smarter format can come later if it is too slow on mobile.
- Anyone running the project must run `npm install` before `npm run dev` or `npm run build`, as usual; tests do not need the file because they pass a fake dictionary.