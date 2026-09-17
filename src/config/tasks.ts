import type { Weekday } from '../lib/date';

/**
 * - 'duo' = samen gedaan door de twee bewoners van hetzelfde verdiep.
 * - 'solo' = één bewoner.
 */
export type TaskKind = 'duo' | 'solo';

export type TaskDefinition = {
  key: string;
  title: string;
  subtitle: string;
  kind: TaskKind;
  /** Tegen wanneer moet het klaar zijn? (1 = maandag ... 7 = zondag) */
  deadlineWeekday: Weekday;
  /** Volgorde in de lijst én in de rotatie. */
  order: number;
  active: boolean;
};

export const DEFAULT_TASKS: TaskDefinition[] = [
  {
    key: 'afwas-keuken',
    title: 'AFWAS + KEUKEN',
    subtitle: 'Alles afwassen, aanrecht en vuur schoonschrobben',
    kind: 'duo',
    deadlineWeekday: 5,
    order: 0,
    active: true,
  },
  {
    key: 'gang-trap',
    title: 'GANG + TRAP',
    subtitle: 'Stofzuigen van gelijkvloers tot boven',
    kind: 'solo',
    deadlineWeekday: 5,
    order: 1,
    active: true,
  },
  {
    key: 'koertje',
    title: 'KOERTJE',
    subtitle: 'Buiten opruimen en vegen',
    kind: 'solo',
    deadlineWeekday: 5,
    order: 2,
    active: true,
  },
  {
    key: 'frigo',
    title: 'FRIGO LEEGMAKEN',
    subtitle: 'Elke vrijdag: alles buiten dat er niet meer in hoort',
    kind: 'solo',
    deadlineWeekday: 5,
    order: 3,
    active: true,
  },
];
