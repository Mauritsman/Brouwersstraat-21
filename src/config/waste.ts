import type { Weekday } from '../lib/date';

/**
 * Afvalkalender voor Brouwersstraat 21, Leuven.
 *
 * Belangrijk: we coderen GEEN losse datums. We beschrijven het *ritme*
 * (vaste weekdag + wekelijks of tweewekelijks) en rekenen de datums uit.
 * Daardoor blijft de kalender ook na 2026 kloppen zonder bij te werken.
 *
 * Wil je iets aanpassen? Je moet maar op twee plaatsen zijn:
 *   - COLLECTION_RULES  -> het normale ritme
 *   - WASTE_EXCEPTIONS  -> feestdagen (kerst/nieuwjaar) die het schema verschuiven
 */

export type FractionId = 'restafval' | 'gft' | 'pmd' | 'papier';

export type Fraction = {
  id: FractionId;
  label: string;
  /** Kleur van het bolletje in de Recycle!-app. */
  color: string;
  /** Korte uitleg voor de legende. */
  hint: string;
};

export const FRACTIONS: Record<FractionId, Fraction> = {
  restafval: {
    id: 'restafval',
    label: 'RESTAFVAL',
    color: '#9AA0A6',
    hint: 'Grijze zak. Alles wat nergens anders bij mag.',
  },
  gft: {
    id: 'gft',
    label: 'GFT',
    color: '#39FF14',
    hint: 'Groen bolletje naast restafval — nog te bevestigen in de Recycle!-legende.',
  },
  pmd: {
    id: 'pmd',
    label: 'PMD',
    color: '#00E5FF',
    hint: 'Blauwe zak. Plastic flessen, metaal, drankkartons.',
  },
  papier: {
    id: 'papier',
    label: 'PAPIER & KARTON',
    color: '#FFC300',
    hint: 'Samengebonden of in een kartonnen doos.',
  },
};

export type Cadence = 'weekly' | 'biweekly';

export type CollectionRule = {
  fractionId: FractionId;
  /** 1 = maandag ... 7 = zondag */
  weekday: Weekday;
  cadence: Cadence;
  /**
   * Enkel voor 'biweekly': een datum waarop deze fractie ZEKER werd opgehaald.
   * Vanaf dat punt telt de app in stappen van 2 weken door, vooruit én terug.
   */
  anchorDate?: string;
  /**
   * false = we zijn hier nog niet 100% zeker van. De app toont dit dan met
   * een "NOG TE BEVESTIGEN"-markering in plaats van het stilletjes te tonen.
   */
  confirmed: boolean;
  note?: string;
};

export const COLLECTION_RULES: CollectionRule[] = [
  // Elke vrijdag restafval.
  { fractionId: 'restafval', weekday: 5, cadence: 'weekly', confirmed: true },

  // Op vrijdag staat er ook een groen bolletje naast restafval.
  // Vermoedelijk GFT, maar nog na te kijken in de legende van de Recycle!-app.
  {
    fractionId: 'gft',
    weekday: 5,
    cadence: 'weekly',
    confirmed: false,
    note: 'Groen bolletje naast restafval — checken in de Recycle!-legende of dit echt GFT is.',
  },

  // PMD en papier delen de donderdag en wisselen elkaar om de twee weken af.
  // De anchorDate is de donderdag waarop die fractie zeker werd opgehaald.
  // >>> Controleer deze twee datums één keer in de Recycle!-app en pas ze aan. <<<
  {
    fractionId: 'pmd',
    weekday: 4,
    cadence: 'biweekly',
    anchorDate: '2026-09-17',
    confirmed: true,
  },
  {
    fractionId: 'papier',
    weekday: 4,
    cadence: 'biweekly',
    anchorDate: '2026-09-24',
    confirmed: true,
  },
];

export type WasteException = {
  /** De geplande ophaaldag die NIET doorgaat. */
  from: string;
  /** De vervangende dag, of null als de ophaling gewoon wegvalt. */
  to: string | null;
  fractionId?: FractionId;
  reason: string;
};

/**
 * Rond kerst en nieuwjaar schuift het schema door de feestdagen.
 * Vul dit één keer per jaar aan met wat de Recycle!-app toont
 * (die zet er zelf een waarschuwingsicoon bij).
 */
export const WASTE_EXCEPTIONS: WasteException[] = [
  // Voorbeeld — vervang door de echte datums zodra Recycle! ze toont:
  // { from: '2026-12-25', to: '2026-12-24', reason: 'Kerstmis' },
  // { from: '2027-01-01', to: '2026-12-31', reason: 'Nieuwjaar' },
];

/** Hoe laat je de zak buiten zet (avond ervoor). */
export const PUT_OUT_HOUR = 19;

/**
 * Onopgelost: ~1x per maand verschijnt er een bruin bolletje in de
 * Recycle!-app en we weten nog niet wat het betekent. Zolang dat zo is,
 * tonen we het als open vraag in het afvalscherm i.p.v. het te verzinnen.
 */
export const OPEN_QUESTIONS: string[] = [
  'Bruin bolletje, ongeveer 1x per maand — betekenis nog onbekend. Nakijken in de legende van de Recycle!-app en hier toevoegen als regel.',
  'Groen bolletje op vrijdag naast restafval — waarschijnlijk GFT, nog te bevestigen.',
];
