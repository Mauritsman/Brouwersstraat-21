import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../src/store/AppStore';
import { FireBackground } from '../src/components/FireBackground';
import { Flame } from '../src/components/Flame';
import { FLOOR_LABELS } from '../src/config/residents';
import { colors, space, text, type } from '../src/theme/theme';
import { registerPushToken } from '../src/lib/notifications';

/**
 * Eenmalige naamkeuze. Geen account, geen wachtwoord: je tikt op je naam
 * en het toestel onthoudt dat. Wisselen kan later via het beheerscherm.
 */
export default function Onboarding() {
  const { residents, chooseIdentity } = useApp();
  const active = residents.filter((r) => r.active);

  const pick = async (id: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await chooseIdentity(id);
    // Toestemming voor notificaties meteen vragen; weigeren mag, de app
    // werkt dan gewoon zonder herinneringen.
    void registerPushToken(id);
  };

  return (
    <FireBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Flame size={56} mode="raging" />
            <Text style={styles.kicker}>BROUWERSSTRAAT 21 · LEUVEN</Text>
            <Text style={styles.title}>WIE BEN JIJ?</Text>
            <Text style={styles.sub}>
              Kies je naam. Eén keer. Geen wachtwoord, geen gedoe — het toestel onthoudt het.
            </Text>
          </View>

          <View style={styles.grid}>
            {active.map((r) => (
              <Pressable key={r.id} onPress={() => void pick(r.id)} style={({ pressed }) => [pressed && styles.pressed]}>
                <LinearGradient
                  colors={[`${r.color}33`, colors.ash]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.card, { borderColor: r.color }]}
                >
                  <Text style={[styles.initial, { color: r.color }]}>{r.name.slice(0, 1).toUpperCase()}</Text>
                  <Text style={styles.name}>{r.name.toUpperCase()}</Text>
                  <Text style={styles.floor}>{FLOOR_LABELS[r.floor]}</Text>
                  <View style={[styles.underline, { backgroundColor: r.color }]} />
                </LinearGradient>
              </Pressable>
            ))}
          </View>

          <Text style={styles.footer}>
            JE NAAM BEPAALT ALLEEN WIE ER AFVINKT. IEDEREEN ZIET ALLES.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </FireBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: space.lg, paddingBottom: space.xxl, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', gap: space.sm, marginBottom: space.xxl },
  kicker: { ...text.label, color: colors.ember, marginTop: space.md },
  title: { ...text.hero, fontSize: 46, textAlign: 'center' },
  sub: { ...text.body, textAlign: 'center', paddingHorizontal: space.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, justifyContent: 'center' },
  card: {
    width: 150,
    borderWidth: 2,
    paddingVertical: space.lg,
    paddingHorizontal: space.md,
    alignItems: 'center',
    gap: 2,
  },
  initial: { fontFamily: type.display, fontSize: 40, lineHeight: 44 },
  name: { fontFamily: type.display, fontSize: 20, letterSpacing: 1.5, color: colors.bone },
  floor: { ...text.label, fontSize: 9 },
  underline: { height: 3, width: 40, marginTop: space.sm },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  footer: { ...text.label, textAlign: 'center', marginTop: space.xxl, fontSize: 9 },
});
