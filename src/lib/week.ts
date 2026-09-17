/**
 * Voegt de berekende rotatie samen met wat er in de database staat
 * (afgevinkt, geruild) tot één lijst die het scherm kan tonen.
 */

import type { FloorId, Resident } from '../config/residents';
import type { TaskDefinition } from '../config/tasks';
import { assignmentsForWeek, residentMap } from './rotation';
import type { Weekday } from './date';
import { mondayOfWeekIndex, weekKey as weekKeyOf } from './date';

/** Wat er per taak in de database wordt bijgehouden. */
export type TaskState = {
  weekKey: string;
  taskKey: string;
  /** Welke beurt van de week. Zo heeft maandag een eigen vinkje naast vrijdag. */
  weekday: Weekday;
  /** null = gewoon de rotatie volgen. Gevuld = geruild. */
  assigneeIds: string[] | null;
  done: boolean;
  doneBy: string | null;
  doneAt: string | null;
};

export type TaskStatus =
  /** Nog te doen, deadline nog ver weg. */
  | 'open'
  /** Nog te doen en de deadline brandt in je nek (< 36 uur). */
  | 'burning'
  /** Afgevinkt. */
  | 'done'
  /** Deadline voorbij, niet afgevinkt. */
  | 'missed';

export type WeekTask = {
  weekKey: string;
  taskKey: string;
  /** De dag van deze beurt. */
  weekday: Weekday;
  task: TaskDefinition;
  /** Hoeveelste beurt van deze taak deze week, bv. 2 van 3. Null bij één beurt. */
  occurrence: { index: number; total: number } | null;
  deadline: Date;
  /** Wie het NU moet doen (na een eventuele ruil). */
  assignees: Resident[];
  /** Wie het volgens de rotatie had moeten doen. */
  rotationAssignees: Resident[];
  swapped: boolean;
  done: boolean;
  doneBy: Resident | null;
  doneAt: Date | null;
  status: TaskStatus;
  floor: FloorId | null;
};

/** Unieke sleutel per beurt: week + taak + dag. */
export function stateKey(weekKey: string, taskKey: string, weekday: Weekday): string {
  return `${weekKey}::${taskKey}::${weekday}`;
}

/** Vanaf hoeveel uur voor de deadline een taak "in brand staat". */
export const BURNING_HOURS = 36;

function statusOf(done: boolean, deadline: Date, now: Date): TaskStatus {
  if (done) return 'done';
  // De deadline loopt tot het einde van die dag.
  const endOfDeadline = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate(), 23, 59, 59);
  if (now.getTime() > endOfDeadline.getTime()) return 'missed';
  const hoursLeft = (endOfDeadline.getTime() - now.getTime()) / (60 * 60 * 1000);
  return hoursLeft <= BURNING_HOURS ? 'burning' : 'open';
}

export function buildWeek(
  residents: Resident[],
  tasks: TaskDefinition[],
  weekIndex: number,
  states: Record<string, TaskState>,
  now: Date = new Date()
): WeekTask[] {
  const byId = residentMap(residents);
  const wk = weekKeyOf(mondayOfWeekIndex(weekIndex));

  const all = assignmentsForWeek(residents, tasks, weekIndex);

  // Tellen hoe vaak elke taak deze week terugkomt, om "beurt 2 van 3" te tonen.
  const totals = new Map<string, number>();
  for (const a of all) totals.set(a.taskKey, (totals.get(a.taskKey) ?? 0) + 1);
  const seen = new Map<string, number>();

  return all.map((assignment) => {
    const state = states[stateKey(wk, assignment.taskKey, assignment.weekday)];
    const total = totals.get(assignment.taskKey) ?? 1;
    const index = (seen.get(assignment.taskKey) ?? 0) + 1;
    seen.set(assignment.taskKey, index);

    const rotationAssignees = assignment.residentIds
      .map((id) => byId.get(id))
      .filter((r): r is Resident => Boolean(r));

    const swapped = Boolean(state?.assigneeIds);
    const assignees = swapped
      ? state!.assigneeIds!.map((id) => byId.get(id)).filter((r): r is Resident => Boolean(r))
      : rotationAssignees;

    const done = state?.done ?? false;

    return {
      weekKey: wk,
      taskKey: assignment.taskKey,
      weekday: assignment.weekday,
      task: assignment.task,
      occurrence: total > 1 ? { index, total } : null,
      deadline: assignment.deadline,
      assignees,
      rotationAssignees,
      swapped,
      done,
      doneBy: state?.doneBy ? byId.get(state.doneBy) ?? null : null,
      doneAt: state?.doneAt ? new Date(state.doneAt) : null,
      status: statusOf(done, assignment.deadline, now),
      floor: assignment.floor,
    };
  });
}

/** Taken van één bewoner deze week. */
export function tasksFor(weekTasks: WeekTask[], residentId: string | null): WeekTask[] {
  if (!residentId) return [];
  return weekTasks.filter((t) => t.assignees.some((a) => a.id === residentId));
}
