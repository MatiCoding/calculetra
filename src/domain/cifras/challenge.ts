import type { Challenge } from "./types";
import { createRandom, hashString } from "./random";

const bag : Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100];
const NUMBERS_PER_CHALLENGE = 6;
const FIRST_DATE_CHALLENGE = "2026-10-19";
const MS_PER_DAY = 24*60*60*1000;

export function getDateKey(date: Date): string {
    return new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Madrid"}).format(date)
}

export function generateChallenge(random: () => number): Challenge {
    const copy : Array<number> = [...bag];
    /* Fisher-Yates shuffle */
    for (let i = 0; i < NUMBERS_PER_CHALLENGE; i++) {
        const j = i + Math.floor(random() * (copy.length - i))
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }

    // Objective
    const min = 101
    const max = 999
    const cantidad = max - min + 1

    return {
        numbers: copy.slice(0, NUMBERS_PER_CHALLENGE),  // We return only the first NUMBERS_PER_CHALLENGE numbers after shuffling.
        target: min + Math.floor(random() * cantidad)    // We generate a random target number between 101 and 999.
    }
}

export function getDailyChallenge(date: Date): Challenge {
    const seed = hashString(getDateKey(date));
    const random = createRandom(seed);
    return generateChallenge(random);
}

export function getChallengeNumber(date: Date): number {
    const ms = Date.parse(getDateKey(date)) - Date.parse(FIRST_DATE_CHALLENGE);
    return ms/MS_PER_DAY + 1;
}