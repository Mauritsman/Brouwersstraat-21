import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, glow, space, text, type } from '../theme/theme';
import { DEADLINE_WEEKDAY } from '../config/residents';
import { dateOfWeekday } from '../lib/date';

/**
 * De vrijdag-deadline: hoe dichter bij vrijdag, hoe roder en feller.
 * Op vrijdag zelf knippert hij.
 */
export function DeadlineBanner({
  weekIndex,
  openCount,
  now = new Date(),
}: {
  weekIndex: number;
  openCount: number;
  now?: Date;
}) {
  const friday = dateOfWeekday(weekIndex, DEADLINE_WEEKDAY);
  const endOfFriday = new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), 23, 59, 59);
  const hoursLeft = (endOfFriday.getTime() - now.getTime()) / 3_600_000;

  const past = hoursLeft < 0;
  // 0 = nog ver weg, 1 = vrijdag zelf.
  const heat = past ? 1 : Math.max(0, Math.min(1, 1 - hoursLeft / (6 * 24)));
  const critical = !past && hoursLeft <= 36;

  const pulse = useSharedValue(0);
  useEffect(() => {
    if (critical || (past && openCount > 0)) {
      pulse.value = withRepeat(withTiming(1, { duration: 750, easing: Easing.inOut(Easing.quad) }), -1, true);
    } else {
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [critical, past, openCount, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: 0.75 + pulse.value * 0.25 }));

  const failed = past && openCount > 0;
  const bandColors = failed
    ? ([colors.dead, '#5A0010'] as const)
    : ([mix(colors.gold, colors.ember, heat), mix(colors.ember, colors.blood, heat)] as const);

  const headline = failed
    ? 'VRIJDAG GEMIST'
    : past
      ? 'KOT WAS PROPER'
      : critical
        ? 'DEADLINE BRANDT'
        : 'VRIJDAG-DEADLINE';

  const sub = failed
    ? `${openCount} ${openCount === 1 ? 'TAAK' : 'TAKEN'} NIET GEDAAN. IEDEREEN ZIET HET.`
    : past
      ? 'ALLES AFGEVINKT. VOLGENDE WEEK OPNIEUW.'
      : openCount === 0
        ? 'ALLES AL KLAAR. RESPECT.'
        : `${openCount} ${openCount === 1 ? 'TAAK' : 'TAKEN'} OPEN · ${formatLeft(hoursLeft)}`;

  return (
    <Animated.View style={[styles.wrap, glow(failed ? colors.dead : colors.ember, 0.4 + heat * 0.4), pulseStyle]}>
      <LinearGradient colors={bandColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.band}>
        <View style={styles.stripes} pointerEvents="none">
          {Array.from({ length: 18 }, (_, i) => (
            <View key={i} style={styles.stripe} />
          ))}
        </View>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.sub}>{sub}</Text>
        <Text style={styles.rule}>HET HELE KOT PROPER TEGEN VRIJDAG</Text>
      </LinearGradient>
    </Animated.View>
  );
}

function formatLeft(hours: number): string {
  if (hours <= 0) return 'TIJD OP';
  if (hours < 24) return `NOG ${Math.ceil(hours)} UUR`;
  return `NOG ${Math.ceil(hours / 24)} DAGEN`;
}

/** Simpele kleurmenging tussen twee hex-codes. */
function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const out = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space.lg },
  band: { paddingVertical: space.lg, paddingHorizontal: space.lg, overflow: 'hidden' },
  stripes: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    opacity: 0.12,
    transform: [{ rotate: '-18deg' }, { scale: 1.6 }],
  },
  stripe: { width: 10, marginRight: 14, backgroundColor: '#000' },
  headline: { ...text.hero, fontSize: 34, lineHeight: 36, color: '#0A0509' },
  sub: { fontFamily: type.bodyBold, fontSize: 14, letterSpacing: 1.5, color: '#1A0A02', marginTop: space.xs },
  rule: {
    fontFamily: type.bodyBold,
    fontSize: 10,
    letterSpacing: 3,
    color: 'rgba(10,5,2,0.6)',
    marginTop: space.sm,
  },
});
