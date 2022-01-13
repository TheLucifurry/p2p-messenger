export function stringifyDate(date: Date): string {
  return date.toISOString();
}
export function parseDate(date: string): Date {
  return new Date(date);
}
export function getDateTimeNowAsString(): string {
  return new Date().toISOString();
}
export function getDateTimeNowAsDate(): Date {
  return new Date();
}
