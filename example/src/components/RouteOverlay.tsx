import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import { colors, radius, spacing } from '../styles/brand';
import type { RouteMeta } from '../services/NavigationService';

interface RouteOverlayProps {
  route: GeoJSON.LineString;
  meta: RouteMeta;
  onCancel: () => void;
}

export function RouteOverlay({ route, meta, onCancel }: RouteOverlayProps) {
  const minutes = Math.ceil(meta.durationS / 60);
  const km = (meta.distanceM / 1000).toFixed(1);

  return (
    <>
      {/* Route line drawn on map — rendered inside MapView by parent */}
      <GeoJSONSource id="route-source" data={route}>
        <Layer
          id="route-line"
          type="line"
          style={{
            lineColor: colors.primary,
            lineWidth: 4,
            lineJoin: 'round',
            lineCap: 'round',
          }}
        />
      </GeoJSONSource>

      {/* Info banner */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.time}>{minutes} phút</Text>
          <Text style={styles.dist}>{km} km</Text>
        </View>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelText}>✕ Hủy</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 15,
  },
  time: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  dist: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cancelBtn: {
    backgroundColor: colors.cancelButtonBg,
    borderWidth: 1,
    borderColor: colors.cancelButton + '44',
    borderRadius: radius.badge + 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  cancelText: {
    fontSize: 12,
    color: colors.cancelButton,
    fontWeight: '600',
  },
});
