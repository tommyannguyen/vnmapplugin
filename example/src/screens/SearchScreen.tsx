import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import debounce from 'debounce';

import { colors, radius, spacing } from '../styles/brand';
import { GeocodingService } from '../services/GeocodingService';
import { navigationService, useNavigationState, type Place } from '../services/NavigationService';

export function SearchScreen() {
  const navigation = useNavigation<any>();
  const state = useNavigationState();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);

  const currentLocationRef = useRef(state.currentLocation);
  useEffect(() => {
    currentLocationRef.current = state.currentLocation;
  }, [state.currentLocation]);

  const doSearch = useRef(
    debounce(async (text: string) => {
      if (!text.trim()) { setResults([]); return; }
      const found = await GeocodingService.search(text, currentLocationRef.current);
      setResults(found);
    }, 300),
  ).current;

  useEffect(() => {
    doSearch(query);
    return () => doSearch.clear();
  }, [query]);

  const handleSelect = useCallback((place: Place) => {
    navigationService.selectPlace(place);
    navigation.goBack();
  }, [navigation]);

  const renderItem = useCallback(({ item, index }: { item: Place; index: number }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
      <View style={[styles.resultIcon, index % 2 === 0 ? styles.iconCyan : styles.iconGreen]}>
        <Text style={styles.resultIconText}>📍</Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultAddr}>{item.address}</Text>
      </View>
      <Text style={styles.resultDist}>
        {item.distanceM >= 1000
          ? `${(item.distanceM / 1000).toFixed(1)} km`
          : `${item.distanceM} m`}
      </Text>
    </TouchableOpacity>
  ), [handleSelect]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Tìm kiếm địa điểm..."
          placeholderTextColor={colors.textDisabled}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
      </View>
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backBtn: { padding: spacing.xs },
  backText: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  input: {
    flex: 1,
    backgroundColor: '#f3f7fb',
    borderWidth: 1.5,
    borderColor: colors.primary + '55',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  list: { flex: 1 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
    gap: spacing.sm,
  },
  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.badge + 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconCyan: { backgroundColor: colors.primary + '18' },
  iconGreen: { backgroundColor: colors.secondary + '18' },
  resultIconText: { fontSize: 14 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  resultAddr: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  resultDist: { fontSize: 11, color: colors.primary, fontWeight: '600', flexShrink: 0 },
});
