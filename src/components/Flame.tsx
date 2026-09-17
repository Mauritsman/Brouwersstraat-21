import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import { colors } from '../theme/theme';

/**
 * Scherp vlam-icoon. Drie standen:
 *   - 'lit'    rustig brandend
 *   - 'raging' woest flikkerend (deadline nadert)
 *   - 'dead'   uitgedoofd, grijs en scheef (taak gemist)
 */
export type FlameMode = 'lit' | 'raging' | 'dead';

const FLAME_PATH =
  'M32 2 L40 18 L47 11 L48 26 L58 22 L52 36 Q60 46 52 55 Q44 62 32 62 Q20 62 12 55 Q4 46 12 36 L6 22 L16 26 L17 11 L24 18 Z';
const CORE_PATH = 'M32 26 L38 38 Q42 46 36 52 Q32 56 28 52 Q22 46 26 38 Z';

export function Flame({
  size = 28,
  mode = 'lit',
  color,
}: {
  size?: number;
  mode?: FlameMode;
  color?: string;
}) {
  const flicker = useSharedValue(0);

  useEffect(() => {
    if (mode === 'dead') {
      flicker.value = withTiming(0, { duration: 300 });
      return;
    }
    const duration = mode === 'raging' ? 260 : 900;
    flicker.value = withRepeat(
      withSequence(
        withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: duration * 1.3, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [mode, flicker]);

  const style = useAnimatedStyle(() => {
    const amount = mode === 'raging' ? 1 : 0.4;
    return {
      transform: [
        { scaleY: 1 + flicker.value * 0.14 * amount },
        { scaleX: 1 - flicker.value * 0.07 * amount },
        { rotate: `${mode === 'dead' ? 12 : (flicker.value - 0.5) * 5 * amount}deg` },
      ],
      opacity: mode === 'dead' ? 0.45 : 0.85 + flicker.value * 0.15,
    };
  });

  const top = color ?? (mode === 'dead' ? '#6B6470' : colors.gold);
  const bottom = color ?? (mode === 'dead' ? '#2E2A33' : mode === 'raging' ? colors.blood : colors.ember);

  return (
    <Animated.View style={style}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <SvgGradient id="flameFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={top} />
            <Stop offset="1" stopColor={bottom} />
          </SvgGradient>
        </Defs>
        <Path d={FLAME_PATH} fill="url(#flameFill)" />
        {mode !== 'dead' && <Path d={CORE_PATH} fill={colors.bone} opacity={0.75} />}
      </Svg>
    </Animated.View>
  );
}
