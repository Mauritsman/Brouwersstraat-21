/**
 * Het vuur-thema. Donker, hard, geen zachte randen.
 * Gebruik ALTIJD deze waarden i.p.v. losse hex-codes in schermen,
 * dan blijft de hele app consistent.
 */

export const colors = {
  /** Achtergronden, van diepst zwart naar lichter grijs. */
  void: '#07060A',
  ash: '#0F0D13',
  steel: '#17151D',
  iron: '#221F2A',
  rust: '#3A2A22',

  /** Vuur. */
  ember: '#FF3B00',
  blaze: '#FF7A00',
  gold: '#FFC300',
  blood: '#B3001B',
  smolder: '#5A1E0A',

  /** Tekst. */
  bone: '#F6F2E9',
  smoke: '#9C93A6',
  faint: '#5E5768',

  /** Status. */
  done: '#39FF14',
  dead: '#FF1744',
} as const;

export const gradients = {
  fire: ['#FFC300', '#FF7A00', '#FF3B00'] as const,
  ember: ['#FF7A00', '#B3001B'] as const,
  danger: ['#FF1744', '#7A0010'] as const,
  steel: ['#221F2A', '#0F0D13'] as const,
  done: ['#39FF14', '#0A8A00'] as const,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 36,
} as const;

/**
 * Scherpe hoeken. Ronde vormen ogen vriendelijk — dat willen we niet.
 * Max 4px, en meestal 0.
 */
export const radius = {
  none: 0,
  sharp: 2,
  soft: 4,
} as const;

export const type = {
  /** Anton: zwaar, condensed, altijd HOOFDLETTERS. Voor titels en taaknamen. */
  display: 'Anton_400Regular',
  /** Barlow: strak en leesbaar. Voor alle gewone tekst. */
  body: 'BarlowCondensed_500Medium',
  bodyBold: 'BarlowCondensed_700Bold',
} as const;

/** Vaste tekststijlen, zodat typografie niet per scherm afdwaalt. */
export const text = {
  hero: {
    fontFamily: type.display,
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: 1,
    color: colors.bone,
    textTransform: 'uppercase' as const,
  },
  title: {
    fontFamily: type.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: 0.8,
    color: colors.bone,
    textTransform: 'uppercase' as const,
  },
  section: {
    fontFamily: type.display,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 2.5,
    color: colors.smoke,
    textTransform: 'uppercase' as const,
  },
  body: {
    fontFamily: type.body,
    fontSize: 15,
    lineHeight: 20,
    color: colors.smoke,
  },
  bodyStrong: {
    fontFamily: type.bodyBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.bone,
  },
  label: {
    fontFamily: type.bodyBold,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.faint,
    textTransform: 'uppercase' as const,
  },
} as const;

/** Gloed onder een kaart die "in brand staat". */
export function glow(color: string, strength = 0.55) {
  return {
    shadowColor: color,
    shadowOpacity: strength,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  };
}
