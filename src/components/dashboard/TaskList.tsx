import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Text } from 'react-native';
import { colors, space, radius, text } from '../../theme/theme';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Geen taken. Maak er eentje aan!</Text>
      </View>
    );
  }

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {activeTasks.length > 0 && (
        <View>
          <Text style={styles.sectionLabel}>ACTIEF ({activeTasks.length})</Text>
          {activeTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </View>
      )}

      {completedTasks.length > 0 && (
        <View style={{ marginTop: space.lg }}>
          <Text style={styles.sectionLabel}>VOLTOOID ({completedTasks.length})</Text>
          {completedTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <View style={[styles.item, task.completed && styles.itemCompleted]}>
      <Pressable
        style={[styles.checkbox, task.completed && styles.checkboxChecked]}
        onPress={() => onToggle(task.id)}
      >
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>
      <Text style={[styles.text, task.completed && styles.textCompleted]}>{task.text}</Text>
      <Pressable style={styles.deleteBtn} onPress={() => onDelete(task.id)}>
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: space.xl,
  },
  emptyText: {
    ...text.body,
    color: colors.faint,
  },
  sectionLabel: {
    ...text.label,
    marginBottom: space.sm,
    marginTop: space.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.steel,
    borderRadius: radius.sharp,
    padding: space.md,
    marginBottom: space.sm,
    gap: space.md,
  },
  itemCompleted: {
    opacity: 0.5,
    backgroundColor: colors.ash,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sharp,
    borderWidth: 2,
    borderColor: colors.ember,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.ember,
  },
  checkmark: {
    color: colors.bone,
    fontSize: 14,
    fontWeight: 'bold',
  },
  text: {
    flex: 1,
    ...text.body,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: colors.faint,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.sharp,
    backgroundColor: colors.blood,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: colors.bone,
    fontSize: 16,
  },
});
