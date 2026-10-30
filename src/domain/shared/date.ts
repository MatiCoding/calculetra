export function getDateKey(date: Date): string {
    return new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Madrid"}).format(date)
}