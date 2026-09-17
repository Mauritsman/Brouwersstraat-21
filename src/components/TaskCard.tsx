import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { Resident } from '../config/residents';
import { FLOOR_LABELS } from '../config/residents';
import type { WeekTask } from '../lib/week';
import { WEEKDAY_NAMES, isoWeekday } from '../lib/date';
import { colors, glow, space, text, type } from '../theme/theme';
import { Flame } from './Flame';
import { ResidentRow } from './ResidentBadge';
import { Sparks } from './Sparks';

const STATUS_COLOR: Record<WeekTask['status'], string> = {
  open: colors.blaze,
  burning: colors.ember,
  done: colors.done,
  missed: colors.dead,
};

export function TaskCard({
  item,
  me,
  onToggle,
  onSwap,
}: {
  item: WeekTask;
  me: Resident | null;
  onToggle: () => void;
  onSwap: () => void;
}) {
  const [sparkTrigger, setSparkTrigger] = useState(0);
  const wasDone = useRef(item.done);

  const shake = useSharedValue(0);
  const stamp = useSharedValue(item.done ? 1 : 0);
  const alarm = useSharedValue(0);

  const accent = STATUS_COLOR[item.status];
  const mine = me ? item.assignees.some((a) => a.id === me.id) : false;

  // "KLAAR!"-stempel slaat in zodra de taak van open naar gedaan gaat.
  useEffect(() => {
    if (item.done && !wasDone.current) {
      setSparkTrigger((n) => n + 1);
      stamp.value = 0;
      stamp.value = withSpring(1, { damping: 6, stiffness: 320, mass: 0.7 });
      shake.value = withSequence(
        withTiming(1, { duration: 45 }),
        withTiming(-1, { duration: 45 }),
        withTiming(0.6, { duration: 45 }),
        withTiming(-0.4, { duration: 45 }),
        withTiming(0, { duration: 60 })
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (!item.done && wasDone.current) {
      stamp.value = withTiming(0, { duration: 160 });
    }
    wasDone.current = item.done;
  }, [item.done, stamp, shake]);

  // Gemiste taak: knipperende waarschuwing.
  useEffect(() => {
    if (item.status === 'missed') {
      alarm.value = withRepeat(withTiming(1, { duration: 620, easing: Easing.inOut(Easing.quad) }), -1, true);
    } else {
      alarm.value = withTiming(0, { duration: 200 });
    }
  }, [item.status, alarm]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value * 9 }, { rotate: `${shake.value * 0.5}deg` }],
  }));

  const stampStyle = useAnimatedStyle(() => ({
    opacity: stamp.value,
    transform: [{ scale: 0.6 + stamp.value * 0.4 }, { rotate: '-13deg' }],
  }));

  const alarmStyle = useAnimatedStyle(() => ({ opacity: 0.35 + alarm.value * 0.65 }));

  const flameMode = item.status === 'missed' ? 'dead' : item.status === 'burning' ? 'raging' : 'lit';

  return (
    <Animated.View style={[styles.wrap, cardStyle, item.status === 'burning' ? glow(colors.ember, 0.5) : null]}>
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onToggle();
        }}
        onLongPress={onSwap}
        delayLongPress={350}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.done }}
        accessibilityLabel={`${item.task.title}, ${item.assignees.map((a) => a.name).join(' en ') || 'niemand'}`}
      >
        <LinearGradient
          colors={
            item.done
              ? [colors.steel, '#0A1A06']
              : item.status === 'missed'
                ? ['#2A0A10', colors.ash]
                : [colors.iron, colors.ash]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Linkerbalk in de statuskleur: in één oogopslag zichtbaar. */}
          <View style={[styles.edge, { backgroundColor: accent }]} />

          <View style={styles.head}>
            <Flame size={30} mode={flameMode} />
            <View style={styles.headText}>
              <Text style={[styles.title, item.done && styles.titleDone]} numberOfLines={2}>
                {item.task.title}
              </Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {item.task.subtitle}
              </Text>
            </View>
            <Checkbox done={item.done} accent={accent} />
          </View>

          <View style={styles.divider} />

          <View style={styles.meta}>
            <View style={styles.metaLeft}>
              <Text style={styles.label}>
                {item.task.kind === 'duo' ? `DUO · ${item.floor ? FLOOR_LABELS[item.floor] : '—'}` : 'SOLO'}
              </Text>
              <ResidentRow residents={item.assignees} dimmed={item.done} />
            </View>
            <View style={styles.metaRight}>
              <Text style={styles.label}>DEADLINE</Text>
              <Text style={[styles.deadline, { color: accent }]}>
                {WEEKDAY_NAMES[isoWeekday(item.deadline)].toUpperCase()}
              </Text>
            </View>
          </View>

          {item.swapped && (
            <Text style={styles.swapped}>
              ⇄ GERUILD — STOND OP {item.rotationAssignees.map((r) => r.name.toUpperCase()).join(' + ') || '—'}
            </Text>
          )}

          {mine && !item.done && (
            <Text style={[styles.yours, { color: accent }]}>
              {item.status === 'missed' ? 'DIT WAS VAN JOU.' : 'DIT IS VAN JOU. GA ERVOOR.'}
            </Text>
          )}

          {item.status === 'missed' && (
            <Animated.View style={[styles.missedBar, alarmStyle]}>
              <Text style={styles.missedText}>
                NIET GEDAAN · {item.assignees.map((a) => a.name.toUpperCase()).join(' + ') || 'NIEMAND'}
              </Text>
            </Animated.View>
          )}

          {item.done && (
            <Animated.View style={[styles.stamp, stampStyle]} pointerEvents="none">
              <Text style={styles.stampText}>KLAAR!</Text>
              {item.doneBy && <Text style={styles.stampBy}>DOOR {item.doneBy.name.toUpperCase()}</Text>}
            </Animated.View>
          )}

          <Sparks trigger={sparkTrigger} />
        </LinearGradient>
      </Pressable>

      <Pressable onPress={onSwap} style={styles.swapButton} accessibilityRole="button">
        <Text style={styles.swapButtonText}>⇄ DOORGEVEN</Text>
      </Pressable>
    </Animated.View>
  );
}

/** Hoekig vakje in plaats van een rond vinkje. */
function Checkbox({ done, accent }: { done: boolean; accent: string }) {
  return (
    <View style={[styles.checkbox, { borderColor: accent, backgroundColor: done ? accent : 'transparent' }]}>
      {done && <Text style={styles.checkmark}>✓</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space.lg },
  pressable: {},
  pressed: { opacity: 0.85 },
  card: { paddingVertical: space.lg, paddingLeft: space.lg + 6, paddingRight: space.lg, overflow: 'hidden' },
  edge: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  headText: { flex: 1 },
  title: { ...text.title, fontSize: 24, lineHeight: 26 },
  titleDone: { color: colors.smoke, textDecorationLine: 'line-through' },
  subtitle: { ...text.body, fontSize: 13, marginTop: 2 },
  checkbox: {
    width: 34,
    height: 34,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { fontFamily: type.display, fontSize: 20, color: colors.void },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: space.md },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: space.md },
  metaLeft: { flex: 1, gap: space.xs },
  metaRight: { alignItems: 'flex-end', gap: space.xs },
  label: text.label,
  deadline: { fontFamily: type.display, fontSize: 18, letterSpacing: 1 },
  swapped: { fontFamily: type.bodyBold, fontSize: 11, letterSpacing: 1.5, color: colors.gold, marginTop: space.md },
  yours: { fontFamily: type.display, fontSize: 13, letterSpacing: 2, marginTop: space.md },
  missedBar: { marginTop: space.md, backgroundColor: colors.dead, paddingVertical: space.sm, paddingHorizontal: space.md },
  missedText: { fontFamily: type.display, fontSize: 14, letterSpacing: 2, color: colors.void },
  stamp: {
    position: 'absolute',
    right: space.md,
    top: space.md,
    borderWidth: 4,
    borderColor: colors.done,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    backgroundColor: 'rgba(7,6,10,0.82)',
    alignItems: 'center',
  },
  stampText: { fontFamily: type.display, fontSize: 24, letterSpacing: 2, color: colors.done },
  stampBy: { fontFamily: type.bodyBold, fontSize: 10, letterSpacing: 2, color: colors.done },
  swapButton: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: space.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  swapButtonText: { fontFamily: type.bodyBold, fontSize: 11, letterSpacing: 2.5, color: colors.smoke },
});
