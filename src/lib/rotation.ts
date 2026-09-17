/**
 * Round-robin rotatie van de weektaken.
 *
 * Regels:
 *  1. Duo-taken draaien per verdiep: week na week schuift de beurt door
 *     (gelijkvloers -> 1ste -> 2de -> gelijkvloers -> ...).
 *  2. Solo-taken gaan naar bewoners die deze week GEEN duo-taak hebben.
 *     Met 6 bewoners en 3 verdiepen blijven er 4 mensen over voor 3
 *     solo-taken, dus elke week valt er precies één persoon vrij.
 *  3. Het startpunt in die pool schuift elke week op, zodat niemand twee
 *     weken na elkaar dezelfde taak krijgt.
 *
 * Alles wordt berekend uit de weekIndex: geen database nodig, elk toestel
 * komt tot hetzelfde antwoord.
 */

import type { FloorId, Resident } from '../config/residents';
import { FLOOR_ORDER } from '../config/residents';
import type { TaskDefinition } from '../config/tasks';
import type { Weekday } from './date';
import { dateOfWeekday } from './date';

export type Assignment = {
  taskKey: string;
  task: TaskDefinition;
  /**
   * Welke dag deze beurt is. Een taak die meerdere keren per week moet
   * gebeuren levert meerdere beurten op, elk met een eigen dag.
   */
  weekday: Weekday;
  /** Wie het volgens de rotatie moet doen. */
  residentIds: string[];
  /** Enkel gevuld bij duo-taken. */
  floor: FloorId | null;
  deadline: Date;
};

/** Sorteer bewoners in een vaste, voorspelbare volgorde. */
function sortResidents(residents: Resident[]): Resident[] {
  return [...residents]
    .filter((r) => r.active)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

/** Positieve modulo, ook voor negatieve weekIndexen (weken vóór 2024). */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Welke verdiepen kunnen een duo-taak aan (minstens 2 actieve bewoners)? */
export function duoCapableFloors(residents: Resident[]): FloorId[] {
  const counts = new Map<FloorId, number>();
  for (const r of sortResidents(residents)) {
    counts.set(r.floor, (counts.get(r.floor) ?? 0) + 1);
  }
  const floors = FLOOR_ORDER.filter((f) => (counts.get(f) ?? 0) >= 2);
  if (floors.length > 0) return floors;
  // Uitzondering: niemand vormt nog een duo -> val terug op alle verdiepen.
  return FLOOR_ORDER.filter((f) => (counts.get(f) ?? 0) > 0);
}

/** Welk verdiep is deze week aan de beurt voor de duo-taken? */
export function duoFloorForWeek(residents: Resident[], weekIndex: number): FloorId | null {
  const floors = duoCapableFloors(residents);
  if (floors.length === 0) return null;
  return floors[mod(weekIndex, floors.length)];
}

/**
 * De taakverdeling voor één week.
 * `residents` en `tasks` komen uit de store, zodat het beheerscherm
 * meteen effect heeft op de rotatie.
 */
export function assignmentsForWeek(
  residents: Resident[],
  tasks: TaskDefinition[],
  weekIndex: number
): Assignment[] {
  const people = sortResidents(residents);
  const activeTasks = [...tasks].filter((t) => t.active).sort((a, b) => a.order - b.order);
  if (people.length === 0 || activeTasks.length === 0) return [];

  const duoFloor = duoFloorForWeek(people, weekIndex);
  const duoMembers = duoFloor ? people.filter((r) => r.floor === duoFloor) : [];
  const duoIds = new Set(duoMembers.map((r) => r.id));

  const soloTasks = activeTasks.filter((t) => t.kind === 'solo');

  // Pool = iedereen zonder duo-taak. Te klein? Dan mag iedereen mee.
  let pool = people.filter((r) => !duoIds.has(r.id));
  if (pool.length < soloTasks.length) pool = people;

  const offset = pool.length > 0 ? mod(weekIndex, pool.length) : 0;

  // Eerst bepalen we PER TAAK wie hem heeft. Daarna splitsen we dat op in
  // beurten. Een taak die drie keer per week moet gebeuren blijft dus de hele
  // week bij hetzelfde duo — je wisselt niet halverwege de week van mensen.
  let soloSeen = 0;
  const perTask = activeTasks.map((task) => {
    if (task.kind === 'duo') {
      return { task, residentIds: duoMembers.map((r) => r.id), floor: duoFloor };
    }
    const person = pool.length > 0 ? pool[mod(offset + soloSeen, pool.length)] : null;
    soloSeen += 1;
    return { task, residentIds: person ? [person.id] : [], floor: null as FloorId | null };
  });

  const assignments: Assignment[] = [];
  for (const { task, residentIds, floor } of perTask) {
    // Geen dagen ingesteld? Val terug op vrijdag, zodat een taak nooit
    // stilletjes uit de lijst verdwijnt.
    const weekdays = task.deadlineWeekdays.length > 0 ? task.deadlineWeekdays : ([5] as Weekday[]);
    for (const weekday of [...weekdays].sort((a, b) => a - b)) {
      assignments.push({
        taskKey: task.key,
        task,
        weekday,
        residentIds,
        floor,
        deadline: dateOfWeekday(weekIndex, weekday),
      });
    }
  }

  // Op volgorde van dag, zodat de week logisch leest van maandag naar zondag.
  return assignments.sort((a, b) => a.weekday - b.weekday || a.task.order - b.task.order);
}

/** Handige lookup: van id naar bewoner. */
export function residentMap(residents: Resident[]): Map<string, Resident> {
  return new Map(residents.map((r) => [r.id, r]));
}
