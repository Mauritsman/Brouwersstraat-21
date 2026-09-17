/** Dun laagje rond AsyncStorage, met JSON en zonder crashes. */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  identity: 'bs21.identity',
  residents: 'bs21.residents',
  tasks: 'bs21.tasks',
  weekState: 'bs21.weekState',
  notifications: 'bs21.notificationPrefs',
} as const;

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Opslag vol of geblokkeerd: de app blijft gewoon werken met de state
    // die in het geheugen zit.
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // stilzwijgend negeren
  }
}
