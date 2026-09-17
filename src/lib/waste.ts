/**
 * Rekent het afvalritme om naar concrete ophaaldagen.
 * Alles komt uit src/config/waste.ts — hier staat geen enkele datum hard.
 */

import type { CollectionRule, Fraction, FractionId, WasteException } from '../config/waste';
import { COLLECTION_RULES, FRACTIONS, WASTE_EXCEPTIONS } from '../config/waste';
import { addDays, dateOfWeekday, fromISODate, isSameDay, toISODate, weekIndexOf } from './date';

export type Pickup = {
  fraction: Fraction;
  /** De dag dat de vuilkar komt. */
  date: Date;
  /** De avond dat de zak buiten moet (dag ervoor). */
  putOutDate: Date;
  /** true als deze ophaling verplaatst is door een feestdag. */
  shifted: boolean;
  shiftReason?: string;
  /** false = nog te bevestigen, tonen met een waarschuwing. */
  confirmed: boolean;
  note?: string;
};

function matchesCadence(rule: CollectionRule, weekIndex: number): boolean {
  if (rule.cadence === 'weekly') return true;
  if (!rule.anchorDate) return false;
  const anchorWeek = weekIndexOf(fromISODate(rule.anchorDate));
  // Elke 2 weken vanaf het ankerpunt — ook terug in de tijd.
  return Math.abs(weekIndex - anchorWeek) % 2 === 0;
}

function findException(
  date: Date,
  fractionId: FractionId,
  exceptions: WasteException[]
): WasteException | undefined {
  const iso = toISODate(date);
  return exceptions.find(
    (e) => e.from === iso && (e.fractionId === undefined || e.fractionId === fractionId)
  );
}

/**
 * Alle ophalingen in één week (maandag t/m zondag van die weekIndex),
 * inclusief ophalingen die door een feestdag NAAR deze week verschoven zijn.
 */
export function pickupsForWeek(
  weekIndex: number,
  rules: CollectionRule[] = COLLECTION_RULES,
  exceptions: WasteException[] = WASTE_EXCEPTIONS
): Pickup[] {
  const pickups: Pickup[] = [];

  // Kijk ook een week voor en na: een verschoven ophaling kan over een
  // weekgrens springen.
  for (let offset = -1; offset <= 1; offset++) {
    const w = weekIndex + offset;
    for (const rule of rules) {
      if (!matchesCadence(rule, w)) continue;

      const plannedDate = dateOfWeekday(w, rule.weekday);
      const exception = findException(plannedDate, rule.fractionId, exceptions);
      if (exception && exception.to === null) continue; // valt helemaal weg

      const actualDate = exception ? fromISODate(exception.to!) : plannedDate;
      if (weekIndexOf(actualDate) !== weekIndex) continue; // hoort bij een andere week

      pickups.push({
        fraction: FRACTIONS[rule.fractionId],
        date: actualDate,
        putOutDate: addDays(actualDate, -1),
        shifted: Boolean(exception),
        shiftReason: exception?.reason,
        confirmed: rule.confirmed,
        note: rule.note,
      });
    }
  }

  return pickups.sort(
    (a, b) => a.date.getTime() - b.date.getTime() || a.fraction.label.localeCompare(b.fraction.label)
  );
}

/** Ophalingen gegroepeerd per dag — handig om "donderdag: PMD" te tonen. */
export function pickupsByDay(pickups: Pickup[]): { date: Date; pickups: Pickup[] }[] {
  const days: { date: Date; pickups: Pickup[] }[] = [];
  for (const p of pickups) {
    const existing = days.find((d) => isSameDay(d.date, p.date));
    if (existing) existing.pickups.push(p);
    else days.push({ date: p.date, pickups: [p] });
  }
  return days;
}

/** De eerstvolgende ophalingen vanaf vandaag, over `weeks` weken heen. */
export function upcomingPickups(from: Date, weeks: number): Pickup[] {
  const startWeek = weekIndexOf(from);
  const out: Pickup[] = [];
  for (let i = 0; i < weeks; i++) {
    out.push(...pickupsForWeek(startWeek + i));
  }
  return out.filter((p) => p.date.getTime() >= new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime());
}
