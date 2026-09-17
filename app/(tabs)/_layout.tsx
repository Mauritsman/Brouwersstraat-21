import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { colors, type } from '../../src/theme/theme';

/** Onderste navigatie: drie schermen, hoekig en donker. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.bar,
        tabBarActiveTintColor: colors.ember,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'DEZE WEEK', tabBarIcon: ({ color }) => <TabGlyph glyph="▲" color={color} /> }}
      />
      <Tabs.Screen
        name="afval"
        options={{ title: 'AFVAL', tabBarIcon: ({ color }) => <TabGlyph glyph="■" color={color} /> }}
      />
      <Tabs.Screen
        name="beheer"
        options={{ title: 'BEHEER', tabBarIcon: ({ color }) => <TabGlyph glyph="✦" color={color} /> }}
      />
    </Tabs>
  );
}

function TabGlyph({ glyph, color }: { glyph: string; color: string }) {
  return (
    <View style={styles.glyphWrap}>
      <Text style={[styles.glyph, { color }]}>{glyph}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.ash,
    borderTopWidth: 2,
    borderTopColor: colors.ember,
    // Ruim genoeg zodat het label niet afgesneden wordt, ook op toestellen
    // met een home-balk onderaan.
    height: 92,
    paddingTop: 10,
    paddingBottom: 26,
  },
  item: { paddingVertical: 2 },
  label: { fontFamily: type.display, fontSize: 11, lineHeight: 15, letterSpacing: 1.8 },
  glyphWrap: { height: 18, justifyContent: 'center' },
  glyph: { fontSize: 14 },
});
