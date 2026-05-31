import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../styles/brand';
import type { Place } from '../services/NavigationService';

interface PlaceCardProps {
  place: Place;
  onDirections: () => void;
  onDismiss: () => void;
}

function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

export function PlaceCard({ place, onDirections, onDismiss }: PlaceCardProps) {
  return (
    <View style={styles.sheet} pointerEvents="box-none">
      <View style={styles.handle} />
      <View style={styles.row}>
        <View style={styles.iconBadge}>
          <Text style={styles.iconText}>📍</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{place.name}</Text>
          <Text style={styles.address}>{place.address}</Text>
          <Text style={styles.distance}>{formatDistance(place.distanceM)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onDirections}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>🚗  Chỉ đường</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.ghostBtn}
        onPress={onDismiss}
        activeOpacity={0.8}
      >
        <Text style={styles.ghostBtnText}>✕  Đóng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 20,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 16 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  address: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  distance: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 3,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.btn,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.btn,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  ghostBtnText: { fontSize: 12, color: colors.textSecondary },
});
