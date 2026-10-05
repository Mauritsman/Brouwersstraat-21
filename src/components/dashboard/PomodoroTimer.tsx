import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { colors, space, radius, text, gradients } from '../../theme/theme';
import LinearGradient from 'expo-linear-gradient';

interface PomodoroTimerProps {
  onSessionComplete?: () => void;
}

export function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const WORK_MINUTES = 25;
  const BREAK_MINUTES = 5;
  const [timeLeft, setTimeLeft] = useState(WORK_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (!isBreak) {
              onSessionComplete?.();
              setSessionsCompleted(s => s + 1);
            }
            return isBreak ? WORK_MINUTES * 60 : BREAK_MINUTES * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const progress = isBreak
    ? 1 - timeLeft / (BREAK_MINUTES * 60)
    : 1 - timeLeft / (WORK_MINUTES * 60);

  const toggleTimer = () => setIsRunning(!isRunning);

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(WORK_MINUTES * 60);
  };

  const skip = () => {
    setIsRunning(false);
    setIsBreak(!isBreak);
    setTimeLeft(isBreak ? WORK_MINUTES * 60 : BREAK_MINUTES * 60);
  };

  return (
    <LinearGradient colors={[colors.iron, colors.steel]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>{isBreak ? 'PAUZE' : 'FOCUS'}</Text>

        <View style={styles.timerContainer}>
          <View style={[styles.progressRing, { opacity: progress }]} />
          <Text style={styles.timer}>{displayTime}</Text>
        </View>

        <View style={styles.controls}>
          <Pressable
            style={[styles.button, { backgroundColor: colors.blaze }]}
            onPress={toggleTimer}
          >
            <Text style={styles.buttonText}>{isRunning ? 'PAUZE' : 'START'}</Text>
          </Pressable>
          <Pressable style={[styles.button, { backgroundColor: colors.steel }]} onPress={skip}>
            <Text style={styles.buttonText}>SKIP</Text>
          </Pressable>
          <Pressable style={[styles.button, { backgroundColor: colors.steel }]} onPress={reset}>
            <Text style={styles.buttonText}>RESET</Text>
          </Pressable>
        </View>

        <Text style={styles.stats}>Sessies voltooid: {sessionsCompleted}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.sharp,
    padding: space.lg,
    marginBottom: space.lg,
  },
  content: {
    alignItems: 'center',
  },
  label: {
    ...text.section,
    marginBottom: space.md,
  },
  timerContainer: {
    position: 'relative',
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  progressRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: colors.ember,
  },
  timer: {
    ...text.hero,
    fontSize: 48,
  },
  controls: {
    flexDirection: 'row',
    gap: space.sm,
    width: '100%',
    marginBottom: space.md,
  },
  button: {
    flex: 1,
    paddingVertical: space.md,
    borderRadius: radius.sharp,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...text.label,
    color: colors.bone,
  },
  stats: {
    ...text.body,
    color: colors.gold,
  },
});
