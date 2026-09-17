/**
 * Datum-helpers. Alles draait rond de ISO-week (maandag = dag 1).
 *
 * De hele rotatie is *deterministisch*: uit een datum leiden we een
 * "weekIndex" af (het aantal weken sinds een vast startpunt). Dezelfde week
 * geeft dus op elk toestel exact dezelfde taakverdeling, zonder server.
 */

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Maandag 1 januari 2024 = ISO-week 1 van 2024. Ons nulpunt. */
export const EPOCH_MONDAY = new Date(2024, 0, 1);

export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1 = maandag ... 7 = zondag

export const WEEKDAY_NAMES: Record<Weekday, string> = {
  1: 'maandag',
  2: 'dinsdag',
  3: 'woensdag',
  4: 'donderdag',
  5: 'vrijdag',
  6: 'zaterdag',
  7: 'zondag',
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  1: 'MA',
  2: 'DI',
  3: 'WO',
  4: 'DO',
  5: 'VR',
  6: 'ZA',
  7: 'ZO',
};

/** Zet een datum op middernacht (lokale tijd), zodat rekenen met dagen klopt. */
export function atMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** 1 = maandag ... 7 = zondag (JS geeft standaard 0 = zondag). */
export function isoWeekday(date: Date): Weekday {
  const day = date.getDay();
  return (day === 0 ? 7 : day) as Weekday;
}

/** De maandag van de week waarin `date` valt. */
export function startOfIsoWeek(date: Date): Date {
  const d = atMidnight(date);
  d.setDate(d.getDate() - (isoWeekday(d) - 1));
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Aantal hele weken tussen EPOCH_MONDAY en de maandag van deze week.
 * Dit is de sleutel waarop de rotatie draait.
 */
export function weekIndexOf(date: Date): number {
  const monday = startOfIsoWeek(date);
  const epoch = atMidnight(EPOCH_MONDAY);
  // Rond af: zomertijd kan een "week" 167 of 169 uur lang maken.
  return Math.round((monday.getTime() - epoch.getTime()) / (7 * DAY_MS));
}

/** De maandag die bij een weekIndex hoort. */
export function mondayOfWeekIndex(weekIndex: number): Date {
  return addDays(atMidnight(EPOCH_MONDAY), weekIndex * 7);
}

/** Een specifieke weekdag binnen een weekIndex. */
export function dateOfWeekday(weekIndex: number, weekday: Weekday): Date {
  return addDays(mondayOfWeekIndex(weekIndex), weekday - 1);
}

/** ISO-jaar en ISO-weeknummer (het nummer dat op je kalender staat). */
export function isoWeekInfo(date: Date): { year: number; week: number } {
  // Truc: de donderdag van een ISO-week bepaalt altijd het ISO-jaar.
  const thursday = addDays(startOfIsoWeek(date), 3);
  const firstThursday = addDays(startOfIsoWeek(new Date(thursday.getFullYear(), 0, 4)), 3);
  const week = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * DAY_MS));
  return { year: thursday.getFullYear(), week };
}

/** Stabiele sleutel voor een week, bv. "2026-W38". Handig als database-id. */
export function weekKey(date: Date): string {
  const { year, week } = isoWeekInfo(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return atMidnight(a).getTime() === atMidnight(b).getTime();
}

/** "vr 19 sep" */
export function formatShortDate(date: Date): string {
  const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  return `${WEEKDAY_SHORT[isoWeekday(date)].toLowerCase()} ${date.getDate()} ${months[date.getMonth()]}`;
}

export function toISODate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function fromISODate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}
