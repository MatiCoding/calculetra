import {canBuild} from './wordLetras.ts';
import { createRandom, hashString } from '../shared/random.ts';
import { getDateKey } from '../shared/date.ts';

// The longest word of the dictionary that can be built with the day's letters.
export function findLongestWord(letters: Array<string>, dictionary: ReadonlySet<string>): string | null {
    let longest: string | null = null;

    for (const word of dictionary) {
        if (!canBuild(word, letters)) continue;

        const isLonger = longest === null || word.length > longest.length;
        const isTieBefore = longest !== null && word.length === longest.length && word.localeCompare(longest, 'es') < 0;

        if (isLonger || isTieBefore) longest = word;
    }
    return longest;
}

export const MAX_HINTS_LETRAS = 3;

// The slots where the day's hints go, in the order they are given.
// They are random but the same for every player on the same day, and never repeat
export function getHintPositions(date: Date, wordLength: number): Array<number> {
    const random = createRandom(hashString(`letras-hints-${getDateKey(date)}`));
    const positions = Array.from({length: wordLength}, (_, index) => index);

    // We apply the Fisher-Yates algorithm as in challengeCifras.ts
    for (let i = positions.length - 1; i > 0; i--){
        const j = Math.floor(random()*(i+1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    return positions.slice(0, MAX_HINTS_LETRAS);
}