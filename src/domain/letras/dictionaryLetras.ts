export const DICTIONARY_URL = '/letras/words.txt';

// One word per line, already normalized by scripts/build-words.js.
export function parseDictionary(text: string): Set<string> {
    return new Set(
        text
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0),
    );
}

export function isInDictionary(word: string, dictionary: ReadonlySet<string>): boolean {
    return dictionary.has(word);
}

// fetchFn is a parameter so the tests can pass a fake one instead of going to the network.
export async function loadDictionary(fetchFn: typeof fetch = fetch): Promise<Set<string>> {
    const response = await fetchFn(DICTIONARY_URL);
    if (!response.ok) throw new Error(`Could not load the dictionary (${response.status})`);
    return parseDictionary(await response.text());
}