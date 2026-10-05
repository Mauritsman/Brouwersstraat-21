import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, space, radius, text } from '../../theme/theme';
import LinearGradient from 'expo-linear-gradient';

interface StatisticsProps {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  tasksToday: number;
}

export function Statistics({ totalTasks, completedTasks, completionRate, tasksToday }: StatisticsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>STATISTIEKEN</Text>

      <View style={styles.grid}>
        <StatCard
          label="Voltooiingspercentage"
          value={`${Math.round(completionRate)}%`}
          gradient={['#FF7A00', '#B3001B']}
        />
        <StatCard
          label="Taken vandaag"
          value={tasksToday.toString()}
          gradient={['#FFC300', '#FF7A00']}
        />
        <StatCard
          label="Totaal voltooid"
          value={completedTasks.toString()}
          gradient={['#39FF14', '#0A8A00']}
        />
        <StatCard
          label="Actieve taken"
          value={(totalTasks - completedTasks).toString()}
          gradient={['#221F2A', '#0F0D13']}
        />
      </View>

      <ProgressBar label="Voortgang vandaag" percentage={completionRate} />
    </View>
  );
}

function StatCard({
  label,
  value,
  gradient,
}: {
  label: string;
  value: string;
  gradient: string[];
}) {
  return (
    <LinearGradient colors={gradient} style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  );
}

function ProgressBar({ label, percentage }: { label: string; percentage: number }) {
  return (
    <View style={styles.progressSection}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{Math.round(percentage)}%</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${Math.min(percentage, 100)}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: space.lg,
  },
  title: {
    ...text.section,
    marginBottom: space.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginBottom: space.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    borderRadius: radius.sharp,
    padding: space.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    ...text.title,
    fontSize: 28,
    marginBottom: space.xs,
  },
  statLabel: {
    ...text.label,
    color: colors.bone,
    fontSize: 10,
  },
  progressSection: {
    backgroundColor: colors.steel,
    borderRadius: radius.sharp,
    padding: space.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  progressLabel: {
    ...text.body,
  },
  progressValue: {
    ...text.bodyStrong,
    color: colors.gold,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.ash,
    borderRadius: radius.sharp,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.ember,
    borderRadius: radius.sharp,
  },
});
