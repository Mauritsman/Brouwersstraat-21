/** Controle van de afvalkalender: `npm run check:waste`. */
import { pickupsForWeek } from '../src/lib/waste';
import { formatShortDate, isoWeekInfo, mondayOfWeekIndex, weekIndexOf } from '../src/lib/date';

const start = weekIndexOf(new Date(2026, 8, 14));
for (let i = 0; i < 10; i++) {
  const w = start + i;
  const monday = mondayOfWeekIndex(w);
  const { week } = isoWeekInfo(monday);
  const line = pickupsForWeek(w)
    .map((p) => `${formatShortDate(p.date)} ${p.fraction.label}${p.confirmed ? '' : ' (?)'}`)
    .join(' | ');
  console.log(`week ${week}  ${line}`);
}
