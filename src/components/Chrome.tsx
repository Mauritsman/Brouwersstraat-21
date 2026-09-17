import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, space, text, type } from '../theme/theme';

/** Sectiekop met een vlammend streepje ervoor. */
export function SectionTitle({ children, right }: { children: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionLeft}>
        <LinearGradient
          colors={[colors.gold, colors.ember]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tick}
        />
        <Text style={text.section}>{children}</Text>
      </View>
      {right}
    </View>
  );
}

/** Hoofdknop: gevulde vuurgradient. */
export function FireButton({
  label,
  onPress,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[style, disabled && styles.disabled]}>
      {({ pressed }) => (
        <LinearGradient
          colors={[colors.gold, colors.ember, colors.blood]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fireButton, pressed && styles.pressed]}
        >
          <Text style={styles.fireButtonText}>{label}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

/** Tweede knop: enkel een rand. */
export function GhostButton({
  label,
  onPress,
  tone = 'neutral',
  style,
}: {
  label: string;
  onPress: () => void;
  tone?: 'neutral' | 'danger' | 'gold';
  style?: ViewStyle;
}) {
  const color = tone === 'danger' ? colors.dead : tone === 'gold' ? colors.gold : colors.smoke;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ghost, { borderColor: color }, pressed && styles.pressed, style]}>
      <Text style={[styles.ghostText, { color }]}>{label}</Text>
    </Pressable>
  );
}

/** Kaartje met een donkere achtergrond, voor blokken info. */
export function Panel({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
    marginTop: space.xl,
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  tick: { width: 16, height: 4 },
  fireButton: { paddingVertical: space.md, paddingHorizontal: space.xl, alignItems: 'center' },
  fireButtonText: { fontFamily: type.display, fontSize: 18, letterSpacing: 2, color: colors.void },
  ghost: { borderWidth: 1, paddingVertical: space.md, paddingHorizontal: space.lg, alignItems: 'center' },
  ghostText: { fontFamily: type.bodyBold, fontSize: 12, letterSpacing: 2 },
  panel: { backgroundColor: colors.steel, borderLeftWidth: 3, borderLeftColor: colors.iron, padding: space.lg },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.4 },
});
