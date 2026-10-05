import React, { useState } from 'react';
import { View, TextInput, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, space, radius, text } from '../../theme/theme';

interface Goal {
  id: string;
  title: string;
  targetDate: string;
  progress: number;
  createdAt: number;
}

interface GoalsTrackerProps {
  goals: Goal[];
  onAdd: (title: string, targetDate: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
  onDelete: (id: string) => void;
}

export function GoalsTracker({ goals, onAdd, onUpdateProgress, onDelete }: GoalsTrackerProps) {
  const [title, setTitle] = useState('');
  const [daysToComplete, setDaysToComplete] = useState('30');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (title.trim() && daysToComplete) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + parseInt(daysToComplete));
      onAdd(title.trim(), targetDate.toISOString().split('T')[0]);
      setTitle('');
      setDaysToComplete('30');
      setShowForm(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DOELEN</Text>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <Text style={styles.emptyText}>Geen doelen ingesteld. Voeg er eentje toe!</Text>
        ) : (
          goals.map(goal => (
            <GoalItem
              key={goal.id}
              goal={goal}
              onUpdateProgress={onUpdateProgress}
              onDelete={onDelete}
            />
          ))
        )}
      </ScrollView>

      {!showForm ? (
        <Pressable style={styles.addButton} onPress={() => setShowForm(true)}>
          <Text style={styles.addButtonText}>+ DOEL TOEVOEGEN</Text>
        </Pressable>
      ) : (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Doeltitel..."
            placeholderTextColor={colors.faint}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Dagen tot voltooid..."
            placeholderTextColor={colors.faint}
            value={daysToComplete}
            onChangeText={setDaysToComplete}
            keyboardType="number-pad"
          />
          <View style={styles.formButtons}>
            <Pressable style={[styles.button, { backgroundColor: colors.ember }]} onPress={handleAdd}>
              <Text style={styles.buttonText}>OPSLAAN</Text>
            </Pressable>
            <Pressable style={[styles.button, { backgroundColor: colors.steel }]} onPress={() => setShowForm(false)}>
              <Text style={styles.buttonText}>ANNULEER</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function GoalItem({
  goal,
  onUpdateProgress,
  onDelete,
}: {
  goal: Goal;
  onUpdateProgress: (id: string, progress: number) => void;
  onDelete: (id: string) => void;
}) {
  const daysLeft = Math.ceil(
    (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <View style={styles.goalItem}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalTitle}>{goal.title}</Text>
        <Pressable onPress={() => onDelete(goal.id)}>
          <Text style={styles.deleteIcon}>✕</Text>
        </Pressable>
      </View>

      <Text style={styles.goalDate}>
        {daysLeft > 0 ? `${daysLeft} dagen over` : 'Vervallen'}
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${goal.progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{goal.progress}%</Text>
      </View>

      <View style={styles.progressButtons}>
        {[25, 50, 75, 100].map(p => (
          <Pressable
            key={p}
            style={[
              styles.progressButton,
              goal.progress === p && styles.progressButtonActive,
            ]}
            onPress={() => onUpdateProgress(goal.id, p)}
          >
            <Text style={styles.progressButtonText}>{p}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: space.lg,
  },
  title: {
    ...text.section,
    marginBottom: space.md,
  },
  list: {
    flex: 1,
    marginBottom: space.md,
  },
  emptyText: {
    ...text.body,
    color: colors.faint,
    textAlign: 'center',
    paddingVertical: space.lg,
  },
  goalItem: {
    backgroundColor: colors.steel,
    borderRadius: radius.sharp,
    padding: space.md,
    marginBottom: space.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  goalTitle: {
    ...text.bodyStrong,
    flex: 1,
  },
  deleteIcon: {
    fontSize: 18,
    color: colors.blood,
  },
  goalDate: {
    ...text.label,
    marginBottom: space.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.ash,
    borderRadius: radius.sharp,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: radius.sharp,
  },
  progressText: {
    ...text.bodyStrong,
    color: colors.gold,
    minWidth: 40,
    textAlign: 'right',
  },
  progressButtons: {
    flexDirection: 'row',
    gap: space.xs,
  },
  progressButton: {
    flex: 1,
    paddingVertical: space.xs,
    borderRadius: radius.sharp,
    backgroundColor: colors.ash,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressButtonActive: {
    backgroundColor: colors.ember,
  },
  progressButtonText: {
    ...text.label,
    color: colors.bone,
  },
  addButton: {
    backgroundColor: colors.ember,
    borderRadius: radius.sharp,
    paddingVertical: space.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.md,
  },
  addButtonText: {
    ...text.label,
    color: colors.bone,
  },
  form: {
    backgroundColor: colors.steel,
    borderRadius: radius.sharp,
    padding: space.md,
    marginBottom: space.md,
    gap: space.sm,
  },
  input: {
    color: colors.bone,
    borderBottomWidth: 1,
    borderBottomColor: colors.faint,
    paddingVertical: space.sm,
    fontFamily: 'BarlowCondensed_500Medium',
  },
  formButtons: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.sm,
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
});
