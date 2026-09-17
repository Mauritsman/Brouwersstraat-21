import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/store/AppStore';
import { FireBackground } from '../../src/components/FireBackground';
import { FireButton, GhostButton, Panel, SectionTitle } from '../../src/components/Chrome';
import { ResidentBadge } from '../../src/components/ResidentBadge';
import { FLAME_PALETTE, FLOOR_LABELS, FLOOR_ORDER, type FloorId } from '../../src/config/residents';
import { isSupabaseConfigured } from '../../src/lib/supabase';
import { KEYS, loadJson, saveJson } from '../../src/lib/storage';
import {
  DEFAULT_PREFS,
  cancelAll,
  notificationsSupported,
  type NotificationPrefs,
} from '../../src/lib/notifications';
import { colors, space, text, type } from '../../src/theme/theme';

/** Beheerscherm: bewoners, taken, notificaties en je eigen naam. */
export default function AdminScreen() {
  const {
    residents,
    tasks,
    me,
    addResident,
    updateResident,
    removeResident,
    setTaskActive,
    forgetIdentity,
    sync,
  } = useApp();

  const [name, setName] = useState('');
  const [floor, setFloor] = useState<FloorId>('gelijkvloers');
  const [color, setColor] = useState(FLAME_PALETTE[0]);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    void loadJson(KEYS.notifications, DEFAULT_PREFS).then(setPrefs);
  }, []);

  const updatePref = async (patch: Partial<NotificationPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    await saveJson(KEYS.notifications, next);
    // Alles uit? Dan meteen de ingeplande herinneringen wissen.
    if (!next.taskReminders && !next.wasteReminders && !next.fridayDeadline) await cancelAll();
  };

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (residents.some((r) => r.id === id)) {
      Alert.alert('Bestaat al', `Er is al een bewoner met de naam ${trimmed}.`);
      return;
    }
    await addResident({ id, name: trimmed, floor, color, active: true });
    setName('');
  };

  return (
    <FireBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>BEHEER</Text>
          <Text style={styles.sub}>Bewoners, taken en herinneringen.</Text>

          <SectionTitle>BEWONERS</SectionTitle>
          {residents.map((r) => (
            <View key={r.id} style={[styles.row, !r.active && styles.rowInactive]}>
              <ResidentBadge resident={r} dimmed={!r.active} />
              <View style={styles.rowRight}>
                <Pressable onPress={() => void cycleFloor(r.id, r.floor, updateResident)} hitSlop={8}>
                  <Text style={styles.floorTag}>{FLOOR_LABELS[r.floor]}</Text>
                </Pressable>
                {r.active ? (
                  <Pressable
                    hitSlop={8}
                    onPress={() =>
                      Alert.alert(
                        'Bewoner verwijderen',
                        `${r.name} uit de rotatie halen? De geschiedenis blijft bewaard.`,
                        [
                          { text: 'Annuleren', style: 'cancel' },
                          { text: 'Verwijderen', style: 'destructive', onPress: () => void removeResident(r.id) },
                        ]
                      )
                    }
                  >
                    <Text style={styles.remove}>VERWIJDER</Text>
                  </Pressable>
                ) : (
                  <Pressable hitSlop={8} onPress={() => void updateResident(r.id, { active: true })}>
                    <Text style={styles.restore}>TERUG</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}

          <SectionTitle>BEWONER TOEVOEGEN</SectionTitle>
          <Panel>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="NAAM"
              placeholderTextColor={colors.faint}
              style={styles.input}
              autoCapitalize="words"
            />

            <Text style={styles.label}>VERDIEP</Text>
            <View style={styles.chips}>
              {FLOOR_ORDER.map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFloor(f)}
                  style={[styles.chip, floor === f && styles.chipActive]}
                >
                  <Text style={[styles.chipText, floor === f && styles.chipTextActive]}>{FLOOR_LABELS[f]}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>VLAM-KLEUR</Text>
            <View style={styles.chips}>
              {FLAME_PALETTE.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchActive]}
                />
              ))}
            </View>

            <FireButton label="TOEVOEGEN" onPress={() => void submit()} disabled={!name.trim()} style={styles.addButton} />
          </Panel>

          <SectionTitle>TAKEN</SectionTitle>
          {tasks.map((t) => (
            <View key={t.key} style={styles.row}>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, !t.active && styles.dim]}>{t.title}</Text>
                <Text style={styles.taskSub}>
                  {t.kind === 'duo' ? 'DUO · PER VERDIEP' : 'SOLO'} · DEADLINE VRIJDAG
                </Text>
              </View>
              <Switch
                value={t.active}
                onValueChange={(v) => void setTaskActive(t.key, v)}
                trackColor={{ false: colors.iron, true: colors.smolder }}
                thumbColor={t.active ? colors.ember : colors.faint}
              />
            </View>
          ))}
          <Text style={styles.hint}>
            Nieuwe taken voeg je toe in src/config/tasks.ts — de rotatie neemt ze automatisch mee.
          </Text>

          <SectionTitle>HERINNERINGEN</SectionTitle>
          {!notificationsSupported && (
            <Panel style={styles.webWarning}>
              <Text style={styles.body}>
                Je gebruikt de webversie. Herinneringen werken hier niet — die zitten alleen in de
                geïnstalleerde telefoon-app. De taken en de afvalkalender werken wel gewoon.
              </Text>
            </Panel>
          )}
          <Panel>
            <PrefRow
              label="JOUW TAAK"
              hint="Maandagavond en donderdagavond als jij aan de beurt bent."
              value={prefs.taskReminders}
              onChange={(v) => void updatePref({ taskReminders: v })}
            />
            <PrefRow
              label="AFVAL"
              hint="De avond voor elke ophaling."
              value={prefs.wasteReminders}
              onChange={(v) => void updatePref({ wasteReminders: v })}
            />
            <PrefRow
              label="VRIJDAG-DEADLINE"
              hint="Vrijdagochtend: alles moet proper zijn."
              value={prefs.fridayDeadline}
              onChange={(v) => void updatePref({ fridayDeadline: v })}
            />
          </Panel>

          <SectionTitle>JIJ</SectionTitle>
          <Panel>
            <Text style={styles.body}>
              Ingelogd als {me ? me.name : 'onbekend'}. Er is geen wachtwoord — je naam staat alleen
              op dit toestel.
            </Text>
            <GhostButton
              label="ANDERE NAAM KIEZEN"
              tone="gold"
              style={styles.spaced}
              onPress={() => void forgetIdentity()}
            />
          </Panel>

          <SectionTitle>DATABASE</SectionTitle>
          <Panel style={{ borderLeftColor: isSupabaseConfigured ? colors.done : colors.gold }}>
            <Text style={styles.body}>
              {isSupabaseConfigured
                ? `Supabase is ingesteld. Status: ${sync.toUpperCase()}. Iedereen ziet dezelfde taken en vinkjes.`
                : 'Supabase is nog niet ingesteld. De app werkt, maar alles blijft op dit toestel. Zet EXPO_PUBLIC_SUPABASE_URL en EXPO_PUBLIC_SUPABASE_ANON_KEY in .env om te delen met de groep.'}
            </Text>
          </Panel>

          <Text style={styles.footer}>BROUWERSSTRAAT 21 · LEUVEN</Text>
        </ScrollView>
      </SafeAreaView>
    </FireBackground>
  );
}

function PrefRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.prefRow}>
      <View style={styles.prefText}>
        <Text style={styles.prefLabel}>{label}</Text>
        <Text style={styles.prefHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.iron, true: colors.smolder }}
        thumbColor={value ? colors.ember : colors.faint}
      />
    </View>
  );
}

/** Tik op het verdiep om naar het volgende door te schuiven. */
async function cycleFloor(
  id: string,
  current: FloorId,
  update: (id: string, patch: { floor: FloorId }) => Promise<void>
) {
  const next = FLOOR_ORDER[(FLOOR_ORDER.indexOf(current) + 1) % FLOOR_ORDER.length];
  await update(id, { floor: next });
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: space.lg, paddingBottom: space.xxl * 2 },
  title: { ...text.hero },
  sub: { ...text.body, marginTop: space.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.steel,
    borderLeftWidth: 3,
    borderLeftColor: colors.iron,
    padding: space.md,
    marginBottom: space.sm,
    gap: space.md,
  },
  rowInactive: { opacity: 0.55 },
  rowRight: { alignItems: 'flex-end', gap: 2 },
  floorTag: { ...text.label, fontSize: 9, color: colors.smoke },
  remove: { fontFamily: type.bodyBold, fontSize: 10, letterSpacing: 1.5, color: colors.dead },
  restore: { fontFamily: type.bodyBold, fontSize: 10, letterSpacing: 1.5, color: colors.done },
  input: {
    borderWidth: 1,
    borderColor: colors.iron,
    backgroundColor: colors.void,
    color: colors.bone,
    fontFamily: type.display,
    fontSize: 20,
    letterSpacing: 1.5,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    marginBottom: space.md,
  },
  label: { ...text.label, marginBottom: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md },
  chip: { borderWidth: 1, borderColor: colors.iron, paddingHorizontal: space.md, paddingVertical: space.sm },
  chipActive: { borderColor: colors.ember, backgroundColor: colors.smolder },
  chipText: { fontFamily: type.bodyBold, fontSize: 11, letterSpacing: 1.5, color: colors.smoke },
  chipTextActive: { color: colors.bone },
  swatch: { width: 34, height: 34, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: colors.bone },
  addButton: { marginTop: space.sm },
  taskInfo: { flex: 1 },
  taskTitle: { fontFamily: type.display, fontSize: 17, letterSpacing: 1, color: colors.bone },
  taskSub: { ...text.label, fontSize: 9, marginTop: 2 },
  dim: { color: colors.faint },
  hint: { ...text.body, fontSize: 12, marginTop: space.xs },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, marginBottom: space.md },
  prefText: { flex: 1 },
  prefLabel: { fontFamily: type.display, fontSize: 15, letterSpacing: 1.5, color: colors.bone },
  prefHint: { ...text.body, fontSize: 12 },
  body: { ...text.body, fontSize: 14, lineHeight: 20 },
  spaced: { marginTop: space.md },
  webWarning: { borderLeftColor: colors.gold, marginBottom: space.sm },
  footer: { ...text.label, textAlign: 'center', marginTop: space.xxl, fontSize: 9 },
});
