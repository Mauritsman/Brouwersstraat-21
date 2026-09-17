import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { Resident } from '../config/residents';
import { colors, radius, space, type } from '../theme/theme';

/**
 * Naam + hoekige avatar in de vlam-kleur van de bewoner.
 * De avatar is een schuin afgesneden vierkant — geen rond bolletje.
 */
export function ResidentBadge({
  resident,
  size = 'md',
  dimmed = false,
  style,
}: {
  resident: Resident;
  size?: 'sm' | 'md' | 'lg';
  dimmed?: boolean;
  style?: ViewStyle;
}) {
  const dim = size === 'lg' ? 44 : size === 'md' ? 32 : 24;
  const fontSize = size === 'lg' ? 22 : size === 'md' ? 16 : 13;
  const opacity = dimmed ? 0.4 : 1;

  return (
    <View style={[styles.row, { opacity }, style]}>
      <View
        style={[
          styles.avatar,
          {
            width: dim,
            height: dim,
            borderColor: resident.color,
            backgroundColor: `${resident.color}22`,
          },
        ]}
      >
        <Text style={[styles.initial, { color: resident.color, fontSize: fontSize * 0.85 }]}>
          {resident.name.slice(0, 1).toUpperCase()}
        </Text>
        {/* Afgesneden hoek: geeft het een scherp, industrieel randje. */}
        <View style={[styles.notch, { borderTopColor: resident.color }]} />
      </View>
      <Text style={[styles.name, { color: resident.color, fontSize }]} numberOfLines={1}>
        {resident.name.toUpperCase()}
      </Text>
    </View>
  );
}

/** Rijtje badges, bv. de twee bewoners van een duo-taak. */
export function ResidentRow({
  residents,
  size = 'md',
  dimmed = false,
}: {
  residents: Resident[];
  size?: 'sm' | 'md' | 'lg';
  dimmed?: boolean;
}) {
  if (residents.length === 0) {
    return <Text style={styles.nobody}>NIEMAND TOEGEWEZEN</Text>;
  }
  return (
    <View style={styles.group}>
      {residents.map((r, i) => (
        <React.Fragment key={r.id}>
          {i > 0 && <Text style={styles.plus}>+</Text>}
          <ResidentBadge resident={r} size={size} dimmed={dimmed} />
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  group: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: radius.none,
    overflow: 'hidden',
  },
  initial: { fontFamily: type.display, letterSpacing: 0.5 },
  notch: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderLeftWidth: 8,
    borderLeftColor: 'transparent',
  },
  name: { fontFamily: type.display, letterSpacing: 1 },
  plus: { fontFamily: type.display, color: colors.faint, fontSize: 16 },
  nobody: { fontFamily: type.body, color: colors.faint, letterSpacing: 1.5, fontSize: 12 },
});
