const COMBINING_TILDE = '̃';

// Turns what the palyer typed into the form the game uses.
export function normalizeWord(text: string): string {
    return text
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(new RegExp(`N${COMBINING_TILDE}`, 'g'), 'Ñ')
        .replace(/[̀-ͯ]/g, '');
}

export function canBuild(word: string, letters: Array<string>): boolean {
    const available = [...letters];

    for (const letter of word) {
        const index = available.indexOf(letter);
        if (index === -1) return false;
        available.splice(index, 1);
    }

    return true;
}