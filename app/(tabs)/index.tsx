import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp } from '../../src/store/AppStore';
import { FireBackground } from '../../src/components/FireBackground';
import { DeadlineBanner } from '../../src/components/DeadlineBanner';
import { TaskCard } from '../../src/components/TaskCard';
import { SwapSheet } from '../../src/components/SwapSheet';
import { WastePanel } from '../../src/components/WastePanel';
import { SectionTitle } from '../../src/components/Chrome';
import { Flame } from '../../src/components/Flame';
import type { WeekTask } from '../../src/lib/week';
import { tasksFor } from '../../src/lib/week';
import { addDays, formatShortDate, isoWeekInfo, mondayOfWeekIndex, weekIndexOf } from '../../src/lib/date';
import { pickupsForWeek } from '../../src/lib/waste';
import { DEFAULT_PREFS, rescheduleAll } from '../../src/lib/notifications';
import { loadJson, KEYS } from '../../src/lib/storage';
import { colors, space, text, type } from '../../src/theme/theme';

/** Het hoofdscherm: wie doet wat deze week, en wat gaat er buiten. */
export default function WeekScreen() {
  const { me, residents, weekTasks, setDone, swapTask, refresh, sync } = useApp();

  const currentWeek = weekIndexOf(new Date());
  const [weekIndex, setWeekIndex] = useState(currentWeek);
  const [swapTarget, setSwapTarget] = useState<WeekTask | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const tasks = weekTasks(weekIndex);
  const monday = mondayOfWeekIndex(weekIndex);
  const { week } = isoWeekInfo(monday);
  const pickups = useMemo(() => pickupsForWeek(weekIndex), [weekIndex]);

  const mine = tasksFor(tasks, me?.id ?? null);
  const openCount = tasks.filter((t) => !t.done).length;
  const missed = tasks.filter((t) => t.status === 'missed');

  // Herinneringen opnieuw inplannen zodra de taken (of een ruil) wijzigen.
  useEffect(() => {
    (async () => {
      const prefs = await loadJson(KEYS.notifications, DEFAULT_PREFS);
      const weeks = [0, 1, 2].map((offset) => ({
        weekIndex: currentWeek + offset,
        tasks: weekTasks(currentWeek + offset),
      }));
      await rescheduleAll(me, weeks, prefs);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id, currentWeek, JSON.stringify(tasks.map((t) => [t.taskKey, t.done, t.assignees.map((a) => a.id)]))]);

  return (
    <FireBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor={colors.ember}
              onRefresh={async () => {
                setRefreshing(true);
                await refresh();
                setRefreshing(false);
              }}
            />
          }
        >
          <Header sync={sync} />

          <WeekNav
            week={week}
            monday={monday}
            isCurrent={weekIndex === currentWeek}
            onPrev={() => setWeekIndex((w) => w - 1)}
            onNext={() => setWeekIndex((w) => w + 1)}
            onToday={() => setWeekIndex(currentWeek)}
          />

          <DeadlineBanner weekIndex={weekIndex} openCount={openCount} />

          {me && (
            <View style={[styles.hero, { borderColor: me.color }]}>
              <Flame size={26} mode={mine.some((t) => !t.done && t.status === 'burning') ? 'raging' : 'lit'} color={me.color} />
              <View style={styles.heroText}>
                <Text style={[styles.heroLabel, { color: me.color }]}>JOUW OPDRACHT</Text>
                <Text style={styles.heroValue}>
                  {mine.length === 0
                    ? 'NIETS DEZE WEEK. GENIET ERVAN.'
                    : mine.every((t) => t.done)
                      ? 'ALLES AFGEVINKT. BEEST.'
                      : mine
                          .filter((t) => !t.done)
                          .map((t) => t.task.title)
                          .join(' + ')}
                </Text>
              </View>
            </View>
          )}

          <SectionTitle right={<Text style={styles.counter}>{tasks.length - openCount}/{tasks.length}</Text>}>
            TAKEN
          </SectionTitle>

          {tasks.map((item) => (
            <TaskCard
              key={item.taskKey}
              item={item}
              me={me}
              onToggle={() => void setDone(item.weekKey, item.taskKey, !item.done, me?.id ?? null)}
              onSwap={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSwapTarget(item);
              }}
            />
          ))}

          {missed.length > 0 && (
            <>
              <SectionTitle>MUUR VAN SCHANDE</SectionTitle>
              <View style={styles.shame}>
                {missed.map((t) => (
                  <Text key={t.taskKey} style={styles.shameLine}>
                    <Text style={styles.shameName}>
                      {t.assignees.map((a) => a.name.toUpperCase()).join(' + ') || 'NIEMAND'}
                    </Text>
                    {'  '}
                    {t.task.title}
                  </Text>
                ))}
              </View>
            </>
          )}

          <SectionTitle>AFVAL DEZE WEEK</SectionTitle>
          <WastePanel pickups={pickups} />

          <Text style={styles.footer}>BROUWERSSTRAAT 21 · LEUVEN · HOU HET BRANDEND</Text>
        </ScrollView>
      </SafeAreaView>

      <SwapSheet
        task={swapTarget}
        residents={residents}
        onClose={() => setSwapTarget(null)}
        onAssign={(ids) => {
          if (swapTarget) void swapTask(swapTarget.weekKey, swapTarget.taskKey, ids);
          setSwapTarget(null);
        }}
      />
    </FireBackground>
  );
}

function Header({ sync }: { sync: string }) {
  const dotColor =
    sync === 'online' ? colors.done : sync === 'error' ? colors.dead : sync === 'syncing' ? colors.gold : colors.faint;
  const labels: Record<string, string> = {
    online: 'GESYNCT',
    syncing: 'SYNCEN…',
    error: 'OFFLINE',
    local: 'LOKAAL',
  };
  return (
    <View style={styles.header}>
      <Text style={styles.brand}>BROUWERSSTRAAT 21</Text>
      <View style={styles.sync}>
        <View style={[styles.syncDot, { backgroundColor: dotColor }]} />
        <Text style={styles.syncText}>{labels[sync] ?? sync.toUpperCase()}</Text>
      </View>
    </View>
  );
}

function WeekNav({
  week,
  monday,
  isCurrent,
  onPrev,
  onNext,
  onToday,
}: {
  week: number;
  monday: Date;
  isCurrent: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  return (
    <View style={styles.nav}>
      <Pressable onPress={onPrev} hitSlop={12} style={styles.navArrow}>
        <Text style={styles.navArrowText}>◀</Text>
      </Pressable>
      <Pressable onPress={onToday} style={styles.navCenter}>
        <Text style={styles.navWeek}>WEEK {week}</Text>
        <Text style={styles.navRange}>
          {formatShortDate(monday)} — {formatShortDate(addDays(monday, 6))}
          {!isCurrent ? '  · TIK VOOR NU' : ''}
        </Text>
      </Pressable>
      <Pressable onPress={onNext} hitSlop={12} style={styles.navArrow}>
        <Text style={styles.navArrowText}>▶</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: space.lg, paddingBottom: space.xxl * 2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.lg },
  brand: { fontFamily: type.display, fontSize: 15, letterSpacing: 3, color: colors.smoke },
  sync: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  syncDot: { width: 7, height: 7 },
  syncText: { ...text.label, fontSize: 9 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.lg },
  navArrow: { paddingHorizontal: space.md, paddingVertical: space.sm },
  navArrowText: { color: colors.ember, fontSize: 16 },
  navCenter: { alignItems: 'center', flex: 1 },
  navWeek: { ...text.hero, fontSize: 36 },
  navRange: { ...text.label, marginTop: 2 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: 2,
    backgroundColor: colors.ash,
    padding: space.md,
    marginBottom: space.sm,
  },
  heroText: { flex: 1 },
  heroLabel: { ...text.label, fontSize: 10 },
  heroValue: { fontFamily: type.display, fontSize: 19, letterSpacing: 1, color: colors.bone, marginTop: 2 },
  counter: { fontFamily: type.display, fontSize: 16, letterSpacing: 1, color: colors.ember },
  shame: { backgroundColor: '#1A0509', borderLeftWidth: 4, borderLeftColor: colors.dead, padding: space.md, gap: space.sm },
  shameLine: { fontFamily: type.body, fontSize: 14, color: colors.smoke },
  shameName: { fontFamily: type.display, fontSize: 15, letterSpacing: 1, color: colors.dead },
  footer: { ...text.label, textAlign: 'center', marginTop: space.xxl, fontSize: 9 },
});
