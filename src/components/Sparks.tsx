import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '../theme/theme';

/**
 * Explosie van vonken. Speelt één keer af wanneer `trigger` verandert —
 * gebruikt bij het afvinken van een taak.
 */
export function Sparks({ trigger }: { trigger: number }) {
  if (trigger === 0) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 16 }, (_, i) => (
        <Spark key={`${trigger}-${i}`} index={i} />
      ))}
    </View>
  );
}

function Spark({ index }: { index: number }) {
  const t = useSharedValue(0);
  const angle = (index / 16) * Math.PI * 2 + (index % 3) * 0.2;
  const distance = 70 + (index % 5) * 26;

  useEffect(() => {
    t.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.quad) });
  }, [t]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [
      { translateX: Math.cos(angle) * distance * t.value },
      { translateY: Math.sin(angle) * distance * t.value - t.value * t.value * 26 },
      { scale: 1 - t.value * 0.6 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.spark,
        { backgroundColor: index % 3 === 0 ? colors.gold : index % 3 === 1 ? colors.blaze : colors.ember },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  spark: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 5,
    height: 5,
  },
});
