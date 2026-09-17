import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Pickup } from '../lib/waste';
import { pickupsByDay } from '../lib/waste';
import { WEEKDAY_NAMES, formatShortDate, isoWeekday, isSameDay } from '../lib/date';
import { colors, space, text, type } from '../theme/theme';

/** Eén afvalfractie als hoekig blokje met de kleur van het Recycle!-bolletje. */
export function FractionChip({ pickup, small = false }: { pickup: Pickup; small?: boolean }) {
  return (
    <View style={[styles.chip, { borderColor: pickup.fraction.color }, small && styles.chipSmall]}>
      <View style={[styles.dot, { backgroundColor: pickup.fraction.color }]} />
      <Text style={[styles.chipText, { color: pickup.fraction.color }, small && styles.chipTextSmall]}>
        {pickup.fraction.label}
      </Text>
      {!pickup.confirmed && <Text style={styles.unconfirmed}>?</Text>}
    </View>
  );
}

/** De afvalkalender voor één week, gegroepeerd per dag. */
export function WastePanel({ pickups, now = new Date() }: { pickups: Pickup[]; now?: Date }) {
  const days = pickupsByDay(pickups);

  if (days.length === 0) {
    return <Text style={styles.empty}>GEEN OPHALING DEZE WEEK.</Text>;
  }

  return (
    <View style={styles.panel}>
      {days.map(({ date, pickups: dayPickups }) => {
        const today = isSameDay(date, now);
        const tomorrow = isSameDay(date, new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
        return (
          <View key={date.toISOString()} style={[styles.day, today && styles.dayToday]}>
            <View style={styles.dayHead}>
              <Text style={[styles.dayName, today && styles.dayNameToday]}>
                {WEEKDAY_NAMES[isoWeekday(date)].toUpperCase()}
              </Text>
              <Text style={styles.dayDate}>{formatShortDate(date)}</Text>
            </View>

            <View style={styles.chips}>
              {dayPickups.map((p) => (
                <FractionChip key={`${p.fraction.id}-${date.toISOString()}`} pickup={p} />
              ))}
            </View>

            <Text style={styles.putOut}>
              {today
                ? 'VANDAAG OPGEHAALD'
                : tomorrow
                  ? '⚠ VANAVOND BUITENZETTEN'
                  : `BUITEN OP ${formatShortDate(dayPickups[0].putOutDate).toUpperCase()}`}
            </Text>

            {dayPickups.some((p) => p.shifted) && (
              <Text style={styles.shifted}>
                ⚠ VERSCHOVEN — {dayPickups.find((p) => p.shifted)?.shiftReason}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: space.sm },
  day: {
    backgroundColor: colors.steel,
    borderLeftWidth: 4,
    borderLeftColor: colors.iron,
    padding: space.md,
    gap: space.sm,
  },
  dayToday: { borderLeftColor: colors.ember, backgroundColor: colors.iron },
  dayHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  dayName: { fontFamily: type.display, fontSize: 18, letterSpacing: 1.5, color: colors.bone },
  dayNameToday: { color: colors.ember },
  dayDate: { ...text.label },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
  },
  chipSmall: { paddingVertical: 2 },
  chipText: { fontFamily: type.bodyBold, fontSize: 12, letterSpacing: 1.5 },
  chipTextSmall: { fontSize: 10 },
  dot: { width: 8, height: 8 },
  unconfirmed: { fontFamily: type.bodyBold, fontSize: 11, color: colors.gold },
  putOut: { fontFamily: type.bodyBold, fontSize: 11, letterSpacing: 1.5, color: colors.smoke },
  shifted: { fontFamily: type.bodyBold, fontSize: 11, letterSpacing: 1, color: colors.gold },
  empty: { ...text.body, letterSpacing: 1.5 },
});
