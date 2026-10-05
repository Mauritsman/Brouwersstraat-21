import React, { useState, useEffect } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, space, text } from '../../src/theme/theme';
import { TaskInput } from '../../src/components/dashboard/TaskInput';
import { TaskList } from '../../src/components/dashboard/TaskList';
import { PomodoroTimer } from '../../src/components/dashboard/PomodoroTimer';
import { Statistics } from '../../src/components/dashboard/Statistics';
import { GoalsTracker } from '../../src/components/dashboard/GoalsTracker';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface Goal {
  id: string;
  title: string;
  targetDate: string;
  progress: number;
  createdAt: number;
}

const STORAGE_KEY_TASKS = '@dashboard_tasks';
const STORAGE_KEY_GOALS = '@dashboard_goals';

export default function DashboardScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, goalsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_TASKS),
        AsyncStorage.getItem(STORAGE_KEY_GOALS),
      ]);
      if (tasksData) setTasks(JSON.parse(tasksData));
      if (goalsData) setGoals(JSON.parse(goalsData));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTasks = async (newTasks: Task[]) => {
    setTasks(newTasks);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(newTasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const saveGoals = async (newGoals: Goal[]) => {
    setGoals(newGoals);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(newGoals));
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const addTask = (text: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    saveTasks([...tasks, newTask]);
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  const addGoal = (title: string, targetDate: string) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title,
      targetDate,
      progress: 0,
      createdAt: Date.now(),
    };
    saveGoals([...goals, newGoal]);
  };

  const updateGoalProgress = (id: string, progress: number) => {
    const updated = goals.map(g => (g.id === id ? { ...g, progress } : g));
    saveGoals(updated);
  };

  const deleteGoal = (id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  const tasksToday = tasks.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.createdAt).toDateString() === today;
  }).length;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={text.body}>Laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={text.hero}>PRODUCTIVITEIT</Text>
          <Text style={text.section}>Dashboard</Text>
        </View>

        <View style={styles.section}>
          <Text style={text.section}>TAKEN TOEVOEGEN</Text>
          <TaskInput onAdd={addTask} />
        </View>

        <View style={styles.section}>
          <Text style={text.section}>MIJN TAKEN</Text>
          <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
        </View>

        <View style={styles.section}>
          <PomodoroTimer onSessionComplete={() => {}} />
        </View>

        <View style={styles.section}>
          <Statistics
            totalTasks={tasks.length}
            completedTasks={completedTasks}
            completionRate={completionRate}
            tasksToday={tasksToday}
          />
        </View>

        <View style={styles.section}>
          <GoalsTracker
            goals={goals}
            onAdd={addGoal}
            onUpdateProgress={updateGoalProgress}
            onDelete={deleteGoal}
          />
        </View>

        <View style={styles.footer}>
          <Text style={text.label}>Werk op jezelf. Verbeter jezelf. Wees jezelf.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.void,
  },
  content: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: space.xl,
  },
  section: {
    marginBottom: space.xxl,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: space.xl,
    borderTopWidth: 1,
    borderTopColor: colors.ash,
  },
});
