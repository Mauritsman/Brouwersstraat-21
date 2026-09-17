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
  /**
   * Op welke dagen moet dit gebeuren? (1 = maandag ... 7 = zondag)
   *
   * Meerdere dagen = meerdere beurten per week, elk met een eigen deadline
   * en een eigen vinkje. De keuken moet bijvoorbeeld drie keer per week:
   * maandag, woensdag en vrijdag.
   */
  deadlineWeekdays: Weekday[];
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
    deadlineWeekdays: [1, 3, 5], // maandag, woensdag, vrijdag
    order: 0,
    active: true,
  },
  {
    key: 'gang-trap',
    title: 'GANG + TRAP',
    subtitle: 'Stofzuigen van gelijkvloers tot boven',
    kind: 'solo',
    deadlineWeekdays: [5],
    order: 1,
    active: true,
  },
  {
    key: 'koertje',
    title: 'KOERTJE',
    subtitle: 'Buiten opruimen en vegen',
    kind: 'solo',
    deadlineWeekdays: [5],
    order: 2,
    active: true,
  },
  {
    key: 'frigo',
    title: 'FRIGO LEEGMAKEN',
    subtitle: 'Elke vrijdag: alles buiten dat er niet meer in hoort',
    kind: 'solo',
    deadlineWeekdays: [5],
    order: 3,
    active: true,
  },
];
