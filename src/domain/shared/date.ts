export function getDateKey(date: Date): string {
    return new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Madrid"}).format(date)
}

// Time left, in ms, until the next daily challenge, which starts at midnight in Madrid.
export function msUntilNextChallenge(date: Date): number {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(date);
    const part = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const elapsed = (part('hour') * 3600 + part('minute') * 60 + part('second')) * 1000 + date.getMilliseconds();
    return 24 * 3600 * 1000 - elapsed;
}

// Writes a time in ms as hh:mm:ss.
export function formatCountdown(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
}