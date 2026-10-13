import type { Challenge } from "./types";
import { createRandom, hashString } from "./random";

const bag : Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100];

export function getDateKey(date: Date): string {
    return new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Madrid"}).format(date)
}

export function generateChallenge(random: () => number): Challenge {
    const copy : Array<number> = [...bag];
    /* Fisher-Yates shuffle */
    for (let i = 5; i >= 0; i--) {
        const j = Math.floor(random() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }

    // Objective
    const min = 101
    const max = 999
    const cantidad = max - min + 1

    return {
        numbers: copy.slice(0, 6),  // We return only the first 6 numbers after shuffling.
        target: min + Math.floor(random() * cantidad)    // We generate a random target number between 100 and 999.
    }
}

export function getDailyChallenge(date: Date): Challenge {
    const seed = hashString(getDateKey(date));
    const random = createRandom(seed);
    return generateChallenge(random);
}