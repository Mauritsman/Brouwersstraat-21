import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Anton_400Regular } from '@expo-google-fonts/anton';
import {
  BarlowCondensed_500Medium,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed';
import { AppProvider, useApp } from '../src/store/AppStore';
import { colors } from '../src/theme/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Anton_400Regular,
    BarlowCondensed_500Medium,
    BarlowCondensed_700Bold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <AppProvider>
      <StatusBar style="light" />
      <Gate />
    </AppProvider>
  );
}

/**
 * Stuurt je naar het naamkeuze-scherm als de app nog niet weet wie je bent.
 * Er is geen wachtwoord: je kiest één keer je naam, die blijft lokaal staan.
 */
function Gate() {
  const { ready, identity } = useApp();
  const segments = useSegments();
  const router = useRouter();

  const hide = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (ready) void hide();
  }, [ready, hide]);

  useEffect(() => {
    if (!ready) return;
    const onOnboarding = segments[0] === 'onboarding';
    if (!identity && !onOnboarding) router.replace('/onboarding');
    if (identity && onOnboarding) router.replace('/');
  }, [ready, identity, segments, router]);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <Text style={styles.bootText}>BROUWERSSTRAAT 21</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.void },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.void, alignItems: 'center', justifyContent: 'center' },
  bootText: { fontFamily: 'Anton_400Regular', fontSize: 22, letterSpacing: 4, color: colors.ember },
});
