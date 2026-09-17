/**
 * Supabase-client.
 *
 * De app werkt OOK zonder Supabase: dan blijft alles lokaal op je toestel
 * staan (handig om eerst te testen). Zodra je de twee sleutels in .env zet,
 * synct de app automatisch met de database en ziet iedereen hetzelfde.
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;

/**
 * Supabase heeft deze sleutel hernoemd. Nieuwe projecten tonen een
 * "publishable key" (begint met sb_publishable_), oudere projecten een
 * "anon public key" (begint met eyJ). Allebei werken; we accepteren beide
 * namen zodat het niet uitmaakt welke je invult.
 */
const anonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        storage: AsyncStorage,
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

/** Tabelnamen op één plek, zodat een typfout niet stil kapot gaat. */
export const TABLES = {
  residents: 'residents',
  tasks: 'tasks',
  weekTasks: 'week_tasks',
  pushTokens: 'push_tokens',
} as const;
