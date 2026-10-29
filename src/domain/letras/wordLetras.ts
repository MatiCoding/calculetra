// Turns what the player typed into the form the game uses: upper case,
// no accents (CAMIÓN -> CAMION), but the Ñ stays an Ñ.
export function normalizeWord(text: string): string {
    const letters = [...text.trim().toUpperCase().normalize('NFC')];

    return letters
        .map((letter) => (letter === 'Ñ' ? letter : letter.normalize('NFD')[0]))
        .join('');
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

export const MIN_WORD_LENGTH = 3;

// "Enviar" is only enabled when this is true, so a bad word does not waste the answer.
export function canSubmit(word: string, letters: Array<string>): boolean {
    return word.length >= MIN_WORD_LENGTH && canBuild(word, letters);
}