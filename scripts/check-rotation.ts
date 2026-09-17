/**
 * Snelle controle van de rotatie: draai met `npm run check:rotation`.
 * Antwoordt op drie vragen:
 *   1. Krijgt niemand twee weken na elkaar dezelfde taak?
 *   2. Komt iedereen ongeveer even vaak aan de beurt?
 *   3. Rouleert het duo-verdiep netjes?
 */
import { DEFAULT_RESIDENTS } from '../src/config/residents';
import { DEFAULT_TASKS } from '../src/config/tasks';
import { assignmentsForWeek, duoFloorForWeek } from '../src/lib/rotation';

const WEEKS = 52;
const lastTaskPerPerson = new Map<string, string>();
const counts = new Map<string, Record<string, number>>();
const floorCounts = new Map<string, number>();
let repeats = 0;

for (let w = 0; w < WEEKS; w++) {
  const alle = assignmentsForWeek(DEFAULT_RESIDENTS, DEFAULT_TASKS, w);
  // Voor de eerlijkheidscheck tellen we per TAAK, niet per beurt: wie de
  // keuken heeft, heeft hem de hele week (ma + wo + vr).
  const assignments = alle.filter(
    (a, i) => alle.findIndex((b) => b.taskKey === a.taskKey) === i
  );
  const thisWeek = new Map<string, string>();
  const floor = duoFloorForWeek(DEFAULT_RESIDENTS, w)!;
  floorCounts.set(floor, (floorCounts.get(floor) ?? 0) + 1);

  for (const a of assignments) {
    for (const id of a.residentIds) {
      if (lastTaskPerPerson.get(id) === a.taskKey) {
        console.log(`  ! week ${w}: ${id} heeft ${a.taskKey} twee weken na elkaar`);
        repeats++;
      }
      thisWeek.set(id, a.taskKey);
      const c = counts.get(id) ?? {};
      c[a.taskKey] = (c[a.taskKey] ?? 0) + 1;
      counts.set(id, c);
    }
  }
  lastTaskPerPerson.clear();
  for (const [id, key] of thisWeek) lastTaskPerPerson.set(id, key);
}

console.log(`\nEerste 12 weken:`);
for (let w = 0; w < 12; w++) {
  const alle = assignmentsForWeek(DEFAULT_RESIDENTS, DEFAULT_TASKS, w);
  const uniek = alle.filter((a, i) => alle.findIndex((b) => b.taskKey === a.taskKey) === i);
  const line = uniek.map((a) => `${a.task.key}=${a.residentIds.join('+') || '-'}`).join('  ');
  console.log(`  w${String(w).padStart(2)}  ${line}`);
}

console.log(`\nAantal taken per bewoner over ${WEEKS} weken:`);
for (const r of DEFAULT_RESIDENTS) {
  const c = counts.get(r.id) ?? {};
  const total = Object.values(c).reduce((a, b) => a + b, 0);
  console.log(`  ${r.name.padEnd(8)} totaal ${String(total).padStart(3)}  ${JSON.stringify(c)}`);
}

console.log(`\nDuo-verdiep beurten: ${JSON.stringify(Object.fromEntries(floorCounts))}`);

// Hoeveel losse beurten levert een week op?
const beurten = assignmentsForWeek(DEFAULT_RESIDENTS, DEFAULT_TASKS, 0);
console.log(`\nBeurten in week 0 (${beurten.length} stuks):`);
const dagen = ['', 'ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
for (const b of beurten) {
  console.log(`  ${dagen[b.weekday]}  ${b.task.title.padEnd(16)} ${b.residentIds.join(' + ') || '-'}`);
}
console.log(repeats === 0 ? '\nOK: niemand twee weken na elkaar dezelfde taak.' : `\nFOUT: ${repeats} herhalingen.`);
process.exit(repeats === 0 ? 0 : 1);
