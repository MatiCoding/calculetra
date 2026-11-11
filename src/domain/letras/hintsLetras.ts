import {canBuild} from './wordLetras.ts';

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