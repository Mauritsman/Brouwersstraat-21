import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/theme';

/**
 * Achtergrond van elk scherm: zwart met een smeulende gloed onderaan en
 * een paar opstijgende vonken. Puur decoratief, vangt geen tikken op.
 */
export function FireBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.void, colors.ash, '#1A0B05']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(255,59,0,0.18)']}
        style={styles.floorGlow}
        pointerEvents="none"
      />
      <Embers />
      {children}
    </View>
  );
}

/** Een handvol vonken die traag omhoog drijven. */
function Embers() {
  const seeds = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({ id: i, left: (i * 37) % 100, delay: (i * 611) % 5200, size: 1 + (i % 3) })),
    []
  );
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {seeds.map((s) => (
        <Ember key={s.id} left={s.left} delay={s.delay} size={s.size} />
      ))}
    </View>
  );
}

function Ember({ left, delay, size }: { left: number; delay: number; size: number }) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      progress.value = withRepeat(
        withTiming(1, { duration: 6000 + delay, easing: Easing.linear }),
        -1,
        false
      );
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value < 0.1 ? progress.value * 6 : 0.7 * (1 - progress.value),
    transform: [
      { translateY: -progress.value * 620 },
      { translateX: Math.sin(progress.value * 7) * 14 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.ember,
        { left: `${left}%`, width: size * 2, height: size * 2, backgroundColor: size > 2 ? colors.gold : colors.blaze },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.void },
  floorGlow: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 220 },
  ember: { position: 'absolute', bottom: 0 },
});
