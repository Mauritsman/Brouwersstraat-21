import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FireBackground } from '../../src/components/FireBackground';
import { WastePanel } from '../../src/components/WastePanel';
import { SectionTitle, Panel } from '../../src/components/Chrome';
import { FRACTIONS, OPEN_QUESTIONS, PUT_OUT_HOUR, WASTE_EXCEPTIONS } from '../../src/config/waste';
import { pickupsForWeek } from '../../src/lib/waste';
import { isoWeekInfo, mondayOfWeekIndex, weekIndexOf } from '../../src/lib/date';
import { colors, space, text, type } from '../../src/theme/theme';

const WEEKS_AHEAD = 8;

/** Afvalkalender: de komende 8 weken, berekend uit het ritme. */
export default function WasteScreen() {
  const startWeek = weekIndexOf(new Date());

  const weeks = useMemo(
    () =>
      Array.from({ length: WEEKS_AHEAD }, (_, i) => {
        const weekIndex = startWeek + i;
        return {
          weekIndex,
          week: isoWeekInfo(mondayOfWeekIndex(weekIndex)).week,
          pickups: pickupsForWeek(weekIndex),
        };
      }),
    [startWeek]
  );

  return (
    <FireBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>AFVAL</Text>
          <Text style={styles.sub}>
            Brouwersstraat 21, Leuven. Zak buiten om {PUT_OUT_HOUR}:00 de avond ervoor.
          </Text>

          {weeks.map(({ weekIndex, week, pickups }, i) => (
            <View key={weekIndex}>
              <SectionTitle>{i === 0 ? `DEZE WEEK · WEEK ${week}` : `WEEK ${week}`}</SectionTitle>
              <WastePanel pickups={pickups} />
            </View>
          ))}

          <SectionTitle>LEGENDE</SectionTitle>
          <Panel>
            {Object.values(FRACTIONS).map((f) => (
              <View key={f.id} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: f.color }]} />
                <View style={styles.legendText}>
                  <Text style={[styles.legendLabel, { color: f.color }]}>{f.label}</Text>
                  <Text style={styles.legendHint}>{f.hint}</Text>
                </View>
              </View>
            ))}
          </Panel>

          <SectionTitle>HET RITME</SectionTitle>
          <Panel>
            <Text style={styles.body}>
              • RESTAFVAL: elke vrijdag.{'\n'}
              • PMD en PAPIER/KARTON: allebei op donderdag, om de twee weken, afwisselend.{'\n'}
              {'\n'}
              De app rekent de datums zelf uit het ritme uit — er staat geen enkele datum vast
              ingebakken. Daardoor blijft de kalender ook na 2026 kloppen zonder dat je iets moet
              bijwerken.
            </Text>
          </Panel>

          <SectionTitle>FEESTDAGEN</SectionTitle>
          <Panel>
            {WASTE_EXCEPTIONS.length === 0 ? (
              <Text style={styles.body}>
                Rond kerst en nieuwjaar schuift het schema. Er staan nu nog geen uitzonderingen
                ingesteld. Kijk eind december in de Recycle!-app (die zet er een waarschuwingsicoon
                bij) en zet de verschoven datums in src/config/waste.ts onder WASTE_EXCEPTIONS.
              </Text>
            ) : (
              WASTE_EXCEPTIONS.map((e) => (
                <Text key={e.from} style={styles.body}>
                  ⚠ {e.from} → {e.to ?? 'valt weg'} ({e.reason})
                </Text>
              ))
            )}
          </Panel>

          <SectionTitle>NOG UIT TE ZOEKEN</SectionTitle>
          <Panel style={styles.questions}>
            {OPEN_QUESTIONS.map((q) => (
              <Text key={q} style={styles.question}>
                ? {q}
              </Text>
            ))}
          </Panel>

          <Text style={styles.footer}>BRON: RECYCLE!-APP · CONTROLEER 1× PER JAAR</Text>
        </ScrollView>
      </SafeAreaView>
    </FireBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: space.lg, paddingBottom: space.xxl * 2 },
  title: { ...text.hero },
  sub: { ...text.body, marginTop: space.xs },
  legendRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start', marginBottom: space.md },
  legendDot: { width: 12, height: 12, marginTop: 3 },
  legendText: { flex: 1 },
  legendLabel: { fontFamily: type.display, fontSize: 15, letterSpacing: 1.5 },
  legendHint: { ...text.body, fontSize: 13 },
  body: { ...text.body, fontSize: 14, lineHeight: 21 },
  questions: { borderLeftColor: colors.gold, gap: space.sm },
  question: { fontFamily: type.body, fontSize: 13, lineHeight: 19, color: colors.gold },
  footer: { ...text.label, textAlign: 'center', marginTop: space.xxl, fontSize: 9 },
});
