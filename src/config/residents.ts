import type { Weekday } from '../lib/date';

/** Een verdiep. Duo-taken worden per verdiep samen gedaan. */
export type FloorId = 'gelijkvloers' | 'eerste' | 'tweede';

export const FLOOR_LABELS: Record<FloorId, string> = {
  gelijkvloers: 'GELIJKVLOERS',
  eerste: '1STE VERDIEP',
  tweede: '2DE VERDIEP',
};

/** Volgorde van de verdiepen in de rotatie. */
export const FLOOR_ORDER: FloorId[] = ['gelijkvloers', 'eerste', 'tweede'];

export type Resident = {
  id: string;
  name: string;
  floor: FloorId;
  /** Eigen "vlam-kleur": naam, avatar en taken krijgen deze kleur. */
  color: string;
  /** Vaste volgorde in de rotatie. Lager = eerder aan de beurt. */
  order: number;
  active: boolean;
};

/**
 * De 6 bewoners van Brouwersstraat 21.
 * Dit is de *seed*: via het beheerscherm kan je bewoners toevoegen,
 * hernoemen of op non-actief zetten. De rotatie rekent met wat er in de
 * store zit, niet met deze lijst.
 */
export const DEFAULT_RESIDENTS: Resident[] = [
  { id: 'jules', name: 'Jules', floor: 'gelijkvloers', color: '#FF3B00', order: 0, active: true },
  { id: 'ruiz', name: 'Ruiz', floor: 'gelijkvloers', color: '#FF8A00', order: 1, active: true },
  { id: 'maurits', name: 'Maurits', floor: 'eerste', color: '#FFC300', order: 2, active: true },
  { id: 'sander', name: 'Sander', floor: 'eerste', color: '#00E5FF', order: 3, active: true },
  { id: 'bas', name: 'Bas', floor: 'tweede', color: '#39FF14', order: 4, active: true },
  { id: 'bo', name: 'Bo', floor: 'tweede', color: '#FF00A8', order: 5, active: true },
];

/** Kleuren die je in het beheerscherm kan kiezen voor een nieuwe bewoner. */
export const FLAME_PALETTE = [
  '#FF3B00',
  '#FF8A00',
  '#FFC300',
  '#FF1744',
  '#00E5FF',
  '#39FF14',
  '#FF00A8',
  '#B026FF',
];

export const DEADLINE_WEEKDAY: Weekday = 5; // vrijdag: het hele kot moet proper zijn
