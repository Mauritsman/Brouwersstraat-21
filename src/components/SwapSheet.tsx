import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Resident } from '../config/residents';
import type { WeekTask } from '../lib/week';
import { colors, space, text, type } from '../theme/theme';
import { ResidentBadge, ResidentRow } from './ResidentBadge';

/**
 * Taak doorgeven. Je kiest wie het overneemt; de hele groep ziet daarna
 * wie de taak nu écht heeft. Terugzetten naar de rotatie kan altijd.
 */
export function SwapSheet({
  task,
  residents,
  onClose,
  onAssign,
}: {
  task: WeekTask | null;
  residents: Resident[];
  onClose: () => void;
  onAssign: (assigneeIds: string[] | null) => void;
}) {
  if (!task) return null;

  const isDuo = task.task.kind === 'duo';
  const candidates = residents.filter((r) => r.active);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <Text style={styles.kicker}>TAAK DOORGEVEN</Text>
        <Text style={styles.title}>{task.task.title}</Text>

        <View style={styles.current}>
          <Text style={styles.label}>NU BIJ</Text>
          <ResidentRow residents={task.assignees} size="sm" />
        </View>

        <Text style={styles.label}>
          {isDuo ? 'KIES HET VERDIEP DAT OVERNEEMT' : 'WIE NEEMT HET OVER?'}
        </Text>

        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {isDuo ? (
            groupByFloor(candidates).map(([floor, members]) => (
              <Pressable
                key={floor}
                style={styles.option}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onAssign(members.map((m) => m.id));
                }}
              >
                <ResidentRow residents={members} size="sm" />
              </Pressable>
            ))
          ) : (
            candidates.map((r) => (
              <Pressable
                key={r.id}
                style={styles.option}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onAssign([r.id]);
                }}
              >
                <ResidentBadge resident={r} />
              </Pressable>
            ))
          )}
        </ScrollView>

        <View style={styles.actions}>
          {task.swapped && (
            <Pressable style={[styles.action, styles.reset]} onPress={() => onAssign(null)}>
              <Text style={styles.resetText}>TERUG NAAR ROTATIE</Text>
            </Pressable>
          )}
          <Pressable style={styles.action} onPress={onClose}>
            <Text style={styles.cancelText}>ANNULEREN</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function groupByFloor(residents: Resident[]): [string, Resident[]][] {
  const map = new Map<string, Resident[]>();
  for (const r of residents) {
    map.set(r.floor, [...(map.get(r.floor) ?? []), r]);
  }
  return [...map.entries()];
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '82%',
    backgroundColor: colors.ash,
    borderTopWidth: 4,
    borderTopColor: colors.ember,
    padding: space.lg,
    paddingBottom: space.xxl,
  },
  grabber: { alignSelf: 'center', width: 54, height: 4, backgroundColor: colors.iron, marginBottom: space.lg },
  kicker: { ...text.label, color: colors.ember },
  title: { ...text.title, marginBottom: space.lg },
  current: { marginBottom: space.lg, gap: space.xs },
  label: { ...text.label, marginBottom: space.sm },
  list: { flexGrow: 0 },
  listContent: { gap: space.sm, paddingBottom: space.md },
  option: {
    borderWidth: 1,
    borderColor: colors.iron,
    backgroundColor: colors.steel,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
  },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  action: { flex: 1, paddingVertical: space.md, alignItems: 'center', borderWidth: 1, borderColor: colors.iron },
  reset: { borderColor: colors.gold },
  resetText: { fontFamily: type.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.gold },
  cancelText: { fontFamily: type.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.smoke },
});
