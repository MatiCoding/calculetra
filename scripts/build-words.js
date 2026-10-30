// Builds the letras dictionary: public/letras/words.txt, one word per line.
// Source: an-array-of-spanish-words (MIT). Run with `npm run words`

import { mkdirSync, writeFileSync } from "node:fs";
import words from 'an-array-of-spanish-words' with {type: 'json'}

const MIN_LENGTH = 3;
const MAX_LENGTH = 9;
const OUTPUT_DIR = 'public/letras';

// Same rules as normalizeWord.
function normalize(word) {
    return [...word.trim().toUpperCase().normalize('NFC')]
        .map((letter) => (letter === 'Ñ' ? letter : letter.normalize('NFD')[0]))
        .join('');
}

const result = new Set();
for (const word of words){
    const normalized = normalize(word);
    const fits = normalized.length >= MIN_LENGTH && normalized.length <= MAX_LENGTH;
    if (fits && /^[A-ZÑ]+$/.test(normalized)) result.add(normalized);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(`${OUTPUT_DIR}/words.txt`, [...result].sort().join('\n') + '\n');
console.log(`${result.size} words written to ${OUTPUT_DIR}/words.txt`);