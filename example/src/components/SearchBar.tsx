import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../styles/brand';

interface SearchBarProps {
  onPress: () => void;
}

export function SearchBar({ onPress }: SearchBarProps) {
  return (
    <TouchableOpacity
      style={styles.pill}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Tìm kiếm địa điểm"
    >
      <Text style={styles.icon}>🔍</Text>
      <Text style={styles.placeholder}>Tìm kiếm địa điểm...</Text>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>🐧</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 10,
  },
  icon: {
    fontSize: 14,
  },
  placeholder: {
    flex: 1,
    fontSize: 14,
    color: colors.textDisabled,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
  },
});
