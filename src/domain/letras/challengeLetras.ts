export const VOWELS: Record<string, number> = { A: 12, E: 13, I: 7, O: 9, U: 4 };
export const CONSONANTS: Record<string, number> = {
    B: 2, C: 4, D: 5, F: 1, G: 2, H: 1, J: 1, L: 5, M: 3, N: 7, Ñ: 1,
    P: 3, Q: 1, R: 7, S: 8, T: 5, V: 1, X: 1, Y: 1, Z: 1,
};

// It takes out a letter from both bags.
export function pickWeighted(bag: Record<string, number>, random: ()=> number): string {
    const entries = Object.entries(bag);
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let r = random() * total;

    for (const [letter, weight] of entries){
        if (r < weight) return letter;
        r -= weight;
    }
    return entries[entries.length - 1][0];
}