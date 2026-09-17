/**
 * Push-notificaties via Expo Notifications.
 *
 * We plannen ze LOKAAL op het toestel. Voordeel: het werkt zonder server en
 * zonder kosten. De app herplant ze telkens je de app opent, zodat ze altijd
 * kloppen met de huidige rotatie en met eventuele ruilen.
 *
 * Er zijn drie soorten:
 *   1. "Jij bent aan de beurt"      -> maandagavond
 *   2. "Zak buiten zetten"          -> de avond voor elke ophaling
 *   3. "Alles moet proper zijn"     -> vrijdagochtend
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type { Resident } from '../config/residents';
import type { WeekTask } from './week';
import { PUT_OUT_HOUR } from '../config/waste';
import { upcomingPickups } from './waste';
import { colors } from '../theme/theme';
import { supabase, TABLES } from './supabase';

export type NotificationPrefs = {
  taskReminders: boolean;
  wasteReminders: boolean;
  fridayDeadline: boolean;
};

export const DEFAULT_PREFS: NotificationPrefs = {
  taskReminders: true,
  wasteReminders: true,
  fridayDeadline: true,
};

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Draait de app als webversie? Dan slaan we notificaties helemaal over.
 * expo-notifications werkt daar niet, en we willen geen crash.
 */
export const notificationsSupported = Platform.OS !== 'web';

/** Vraagt toestemming. Geeft false terug als de gebruiker weigert. */
export async function ensurePermission(): Promise<boolean> {
  if (!notificationsSupported) return false;
  if (!Device.isDevice) return false; // simulators krijgen geen echte pushes

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('bs21', {
      name: 'Brouwersstraat 21',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 100, 250],
      lightColor: colors.ember,
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/**
 * Registreert het Expo push-token in Supabase. Nodig als je later
 * notificaties vanaf een server wil sturen (bv. "Bo heeft jouw taak
 * overgenomen"). Voor de gewone herinneringen is dit niet vereist.
 */
export async function registerPushToken(residentId: string): Promise<string | null> {
  try {
    if (!notificationsSupported) return null;
    if (!(await ensurePermission())) return null;
    const projectId =
      (require('expo-constants').default?.expoConfig?.extra?.eas?.projectId as string | undefined) ?? undefined;
    const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
    if (supabase && token) {
      await supabase
        .from(TABLES.pushTokens)
        .upsert({ resident_id: residentId, token, updated_at: new Date().toISOString() });
    }
    return token;
  } catch {
    return null;
  }
}

function at(date: Date, hour: number, minute = 0): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0);
}

async function schedule(title: string, body: string, when: Date) {
  if (when.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true, ...(Platform.OS === 'android' ? { channelId: 'bs21' } : {}) },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
  });
}

/**
 * Wist alles en plant de komende weken opnieuw in.
 * Wordt aangeroepen bij het openen van de app en na elke ruil.
 */
export async function rescheduleAll(
  me: Resident | null,
  weeks: { weekIndex: number; tasks: WeekTask[] }[],
  prefs: NotificationPrefs
): Promise<void> {
  if (!(await ensurePermission())) return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const { tasks } of weeks) {
    const mine = me ? tasks.filter((t) => t.assignees.some((a) => a.id === me.id) && !t.done) : [];

    if (prefs.taskReminders && mine.length > 0) {
      // Maandagavond 18:00: de week begint, dit is jouw lijst.
      const monday = new Date(mine[0].deadline);
      monday.setDate(monday.getDate() - (mine[0].task.deadlineWeekday - 1));
      const names = mine.map((t) => t.task.title).join(' + ');
      await schedule('JIJ BENT AAN DE BEURT', `${names}. Deadline vrijdag. Niet uitstellen.`, at(monday, 18));

      // Donderdagavond 20:00: laatste waarschuwing voor de vrijdag-deadline.
      const thursday = new Date(mine[0].deadline);
      thursday.setDate(thursday.getDate() - 1);
      await schedule('LAATSTE KANS', `${names} — morgen is de deadline.`, at(thursday, 20));
    }

    if (prefs.fridayDeadline) {
      const friday = tasks.find((t) => t.task.deadlineWeekday === 5)?.deadline;
      if (friday) {
        await schedule(
          'VRIJDAG: ALLES MOET PROPER ZIJN',
          'Het hele kot. Geen excuses. Check de app voor wie wat nog moet doen.',
          at(friday, 9)
        );
      }
    }
  }

  if (prefs.wasteReminders) {
    for (const pickup of upcomingPickups(new Date(), 4)) {
      await schedule(
        `${pickup.fraction.label} BUITEN`,
        `Morgen wordt ${pickup.fraction.label.toLowerCase()} opgehaald. Zet het vanavond nog buiten.`,
        at(pickup.putOutDate, PUT_OUT_HOUR)
      );
    }
  }
}

export async function cancelAll(): Promise<void> {
  if (!notificationsSupported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
