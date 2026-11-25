export const NAIROBI_TZ = "Africa/Nairobi";

const kes = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  currencyDisplay: "code",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});
const plain = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

/** "KES 12,500". Rounded to whole shillings. */
export const formatKes = (amount: number): string => kes.format(Math.round(amount)).replace(/\s/gu, " ");

/** "12,500", for places where "KES" is set separately. */
export const formatAmount = (amount: number): string => plain.format(Math.round(amount));

const dateFmt = new Intl.DateTimeFormat("en-KE", {
  timeZone: NAIROBI_TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
});
const dateTimeFmt = new Intl.DateTimeFormat("en-KE", {
  timeZone: NAIROBI_TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** An ISO timestamp, shown as a Nairobi calendar date. */
export const formatDate = (iso: string): string => dateFmt.format(new Date(iso));
export const formatDateTime = (iso: string): string => dateTimeFmt.format(new Date(iso));

const dateOnlyFmt = new Intl.DateTimeFormat("en-KE", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** A date-only string (YYYY-MM-DD) shown as written, never shifted by a time zone. */
export function formatDateOnly(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, y, m, d] = match;
  return dateOnlyFmt.format(new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))));
}

/** Today's date (YYYY-MM-DD) on the Kenyan calendar, matching the backend's rule. */
export const todayInNairobi = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: NAIROBI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

/** "3 days ago", "just now". */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const seconds = (new Date(iso).getTime() - now.getTime()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export const plural = (count: number, one: string, many = `${one}s`): string =>
  `${formatAmount(count)} ${count === 1 ? one : many}`;
