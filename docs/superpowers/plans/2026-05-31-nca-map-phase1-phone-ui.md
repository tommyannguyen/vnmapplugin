# NcA Map — Phase 1: Phone App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the developer example-list app with a Google Maps–style navigation UI backed by vnMap tiles, Pelias geocoding, and OSRM routing.

**Architecture:** A singleton `NavigationService` owns all state (location, search, route). React components subscribe via `useNavigationState()`. `GeocodingService` and `RoutingService` are stateless clients called by `NavigationService`. The map renders via `@maplibre/maplibre-react-native` pointed at vnMap's OSM raster tiles.

**Tech Stack:** React Native 0.81, TypeScript, `@maplibre/maplibre-react-native` v11, Pelias geocoding (`vnmap.tinhocanhminh.com.vn`), OSRM routing (`router.project-osrm.org`), Jest 30.

**MapLibre v11 import note:** Use named imports — `import { Map, Camera, GeoJSONSource, Layer, Marker, UserLocation } from '@maplibre/maplibre-react-native'`. There is no default export. Key API differences: `Map` (not `MapView`), `GeoJSONSource` with `data` prop (not `ShapeSource` with `shape`), unified `Layer` component with `style` prop (not `LineLayer`), `Marker` (not `MarkerView`), `mapStyle` prop accepts `string | StyleSpecification` (use `VNMAP_STYLE` object from brand.ts). No `setAccessToken` call needed.

> **Phase 2 (Android Auto) is a separate plan.** This plan produces a fully working phone app on its own.

---

## File Map

```
example/
  package.json                              ~ add @maplibre/maplibre-react-native
  jest.setup.ts                             ~ mock MapLibre instead of @rnmapbox/maps
  src/
    App.tsx                                 ~ replace navigator with MapScreen root
    styles/
      brand.ts                              ✦ color + spacing tokens
    services/
      NavigationService.ts                  ✦ state store + useNavigationState hook
      GeocodingService.ts                   ✦ Pelias HTTP client
      RoutingService.ts                     ✦ OSRM HTTP client
      LocationService.ts                    ✦ GPS wrapper
    components/
      SearchBar.tsx                         ✦ search pill (home screen)
      PlaceCard.tsx                         ✦ bottom sheet overlay
      RouteOverlay.tsx                      ✦ route line + info banner
    screens/
      MapScreen.tsx                         ✦ home — full-screen map
      SearchScreen.tsx                      ✦ search input + autocomplete list
  __tests__/
    services/
      NavigationService.test.ts             ✦
      GeocodingService.test.ts              ✦
      RoutingService.test.ts                ✦
    components/
      PlaceCard.test.tsx                    ✦
      RouteOverlay.test.tsx                 ✦
      SearchScreen.test.tsx                 ✦
```

**Deleted:** `src/scenes/GroupAndItem.tsx`, `src/scenes/ScreenWithoutMap.tsx`, old `App.js` (replaced by `App.tsx`).

---

## Task 1: Install MapLibre & Create Brand Tokens

**Files:**
- Modify: `example/package.json`
- Create: `example/src/styles/brand.ts`
- Modify: `example/jest.setup.ts`

- [ ] **Step 1.1: Install @maplibre/maplibre-react-native and GeoJSON types**

```bash
cd example
yarn add @maplibre/maplibre-react-native
yarn add --dev @types/geojson
```

Expected: package added to `node_modules/`, no peer-dep errors.

- [ ] **Step 1.2: Android — add MapLibre Maven repo**

Open `example/android/build.gradle`. In `allprojects > repositories`, add:

```groovy
maven { url 'https://api.mapbox.com/downloads/v2/releases/maven' }
// Replace the above mapbox line with:
maven { url 'https://jitpack.io' }
```

Then open `example/android/app/build.gradle` and verify `compileSdkVersion` is ≥ 34. No other changes needed — MapLibre auto-links.

- [ ] **Step 1.3: Create brand tokens**

Create `example/src/styles/brand.ts`:

```typescript
export const colors = {
  primary: '#00b8d4',
  secondary: '#1de9b6',
  background: '#f7f9fb',
  surface: '#ffffff',
  textPrimary: '#1a2332',
  textSecondary: '#8899aa',
  textDisabled: '#c0ccd8',
  error: '#e05555',
  routeGradientStart: '#00b8d4',
  routeGradientEnd: '#1de9b6',
  destinationPin: '#1de9b6',
  cancelButton: '#e05555',
  cancelButtonBg: 'rgba(224,85,85,0.1)',
  border: '#e0eaf0',
  shadow: 'rgba(0,0,0,0.08)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  pill: 28,
  card: 20,
  btn: 22,
  badge: 8,
};

export const VNMAP_API_KEY = 'Op1TSPFL5a6ekOoW';
export const VNMAP_BASE_URL = 'https://vnmap.tinhocanhminh.com.vn';
export const OSRM_BASE_URL = 'https://router.project-osrm.org';

export const VNMAP_STYLE_JSON = JSON.stringify({
  version: 8,
  sources: {
    vnmap: {
      type: 'raster',
      tiles: [
        `${VNMAP_BASE_URL}/api/map/styles/1/tile/{z}/{x}/{y}.png?key=${VNMAP_API_KEY}`,
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'vnmap-raster',
      type: 'raster',
      source: 'vnmap',
    },
  ],
});
```

- [ ] **Step 1.4: Update jest.setup.ts to mock MapLibre**

Replace the entire content of `example/jest.setup.ts`:

```typescript
jest.mock('@maplibre/maplibre-react-native', () => ({
  MapView: 'MapView',
  Camera: 'Camera',
  UserLocation: 'UserLocation',
  ShapeSource: 'ShapeSource',
  LineLayer: 'LineLayer',
  MarkerView: 'MarkerView',
  setAccessToken: jest.fn(),
  Logger: { setLogLevel: jest.fn() },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));
```

- [ ] **Step 1.5: Commit**

```bash
git add example/package.json example/src/styles/brand.ts example/jest.setup.ts example/android/
git commit -m "feat: add maplibre-react-native and brand tokens"
```

---

## Task 2: NavigationService

**Files:**
- Create: `example/src/services/NavigationService.ts`
- Create: `example/__tests__/services/NavigationService.test.ts`

- [ ] **Step 2.1: Write failing tests**

Create `example/__tests__/services/NavigationService.test.ts`:

```typescript
import {
  navigationService,
  useNavigationState,
} from '../../../src/services/NavigationService';

describe('NavigationService', () => {
  beforeEach(() => {
    navigationService.reset();
  });

  it('starts with empty state', () => {
    const state = navigationService.getState();
    expect(state.currentLocation).toBeNull();
    expect(state.searchResults).toEqual([]);
    expect(state.selectedPlace).toBeNull();
    expect(state.activeRoute).toBeNull();
    expect(state.routeMeta).toBeNull();
  });

  it('updateLocation sets currentLocation', () => {
    navigationService.updateLocation({ latitude: 10.82, longitude: 106.63 });
    expect(navigationService.getState().currentLocation).toEqual({
      latitude: 10.82,
      longitude: 106.63,
    });
  });

  it('setSearchResults updates results', () => {
    const places = [
      {
        id: '1',
        name: 'Coffee House',
        address: '45 Le Loi',
        coordinate: { latitude: 10.82, longitude: 106.63 },
        distanceM: 400,
      },
    ];
    navigationService.setSearchResults(places);
    expect(navigationService.getState().searchResults).toEqual(places);
  });

  it('selectPlace sets selectedPlace and clears route', () => {
    navigationService.setActiveRoute(
      { type: 'LineString', coordinates: [] },
      { distanceM: 1000, durationS: 300 },
    );
    const place = {
      id: '1',
      name: 'Coffee',
      address: '1 Main St',
      coordinate: { latitude: 10.82, longitude: 106.63 },
      distanceM: 500,
    };
    navigationService.selectPlace(place);
    expect(navigationService.getState().selectedPlace).toEqual(place);
    expect(navigationService.getState().activeRoute).toBeNull();
    expect(navigationService.getState().routeMeta).toBeNull();
  });

  it('clearPlace clears selectedPlace', () => {
    const place = {
      id: '1',
      name: 'Coffee',
      address: '1 Main St',
      coordinate: { latitude: 10.82, longitude: 106.63 },
      distanceM: 500,
    };
    navigationService.selectPlace(place);
    navigationService.clearPlace();
    expect(navigationService.getState().selectedPlace).toBeNull();
  });

  it('setActiveRoute sets route and meta', () => {
    const geo = { type: 'LineString' as const, coordinates: [[106.63, 10.82]] };
    const meta = { distanceM: 1200, durationS: 480 };
    navigationService.setActiveRoute(geo, meta);
    expect(navigationService.getState().activeRoute).toEqual(geo);
    expect(navigationService.getState().routeMeta).toEqual(meta);
  });

  it('clearRoute clears route and meta', () => {
    navigationService.setActiveRoute(
      { type: 'LineString', coordinates: [] },
      { distanceM: 1000, durationS: 300 },
    );
    navigationService.clearRoute();
    expect(navigationService.getState().activeRoute).toBeNull();
    expect(navigationService.getState().routeMeta).toBeNull();
  });

  it('notifies subscribers on state change', () => {
    const listener = jest.fn();
    const unsubscribe = navigationService.subscribe(listener);
    navigationService.updateLocation({ latitude: 10.82, longitude: 106.63 });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    navigationService.updateLocation({ latitude: 10.83, longitude: 106.64 });
    expect(listener).toHaveBeenCalledTimes(1); // not called after unsubscribe
  });
});
```

- [ ] **Step 2.2: Run tests — verify they fail**

```bash
cd example
yarn jest __tests__/services/NavigationService.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '../../../src/services/NavigationService'`

- [ ] **Step 2.3: Implement NavigationService**

Create `example/src/services/NavigationService.ts`:

```typescript
import { useEffect, useState } from 'react';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  coordinate: LatLng;
  distanceM: number;
}

export interface RouteMeta {
  distanceM: number;
  durationS: number;
}

export interface NavigationState {
  currentLocation: LatLng | null;
  searchQuery: string;
  searchResults: Place[];
  selectedPlace: Place | null;
  activeRoute: GeoJSON.LineString | null;
  routeMeta: RouteMeta | null;
}

type Listener = (state: NavigationState) => void;

const initialState: NavigationState = {
  currentLocation: null,
  searchQuery: '',
  searchResults: [],
  selectedPlace: null,
  activeRoute: null,
  routeMeta: null,
};

class NavigationServiceClass {
  private state: NavigationState = { ...initialState };
  private listeners: Set<Listener> = new Set();

  getState(): NavigationState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset(): void {
    this.state = { ...initialState };
    this.listeners.forEach(l => l(this.state));
  }

  private setState(update: Partial<NavigationState>): void {
    this.state = { ...this.state, ...update };
    this.listeners.forEach(l => l(this.state));
  }

  updateLocation(coords: LatLng): void {
    this.setState({ currentLocation: coords });
  }

  setSearchQuery(query: string): void {
    this.setState({ searchQuery: query });
  }

  setSearchResults(results: Place[]): void {
    this.setState({ searchResults: results });
  }

  selectPlace(place: Place): void {
    this.setState({ selectedPlace: place, activeRoute: null, routeMeta: null });
  }

  clearPlace(): void {
    this.setState({ selectedPlace: null });
  }

  setActiveRoute(geometry: GeoJSON.LineString, meta: RouteMeta): void {
    this.setState({ activeRoute: geometry, routeMeta: meta });
  }

  clearRoute(): void {
    this.setState({ activeRoute: null, routeMeta: null });
  }
}

export const navigationService = new NavigationServiceClass();

export function useNavigationState(): NavigationState {
  const [state, setState] = useState<NavigationState>(() =>
    navigationService.getState(),
  );
  useEffect(() => navigationService.subscribe(setState), []);
  return state;
}
```

- [ ] **Step 2.4: Run tests — verify they pass**

```bash
cd example
yarn jest __tests__/services/NavigationService.test.ts --no-coverage
```

Expected: PASS, 8 tests.

- [ ] **Step 2.5: Commit**

```bash
git add example/src/services/NavigationService.ts example/__tests__/services/NavigationService.test.ts
git commit -m "feat: add NavigationService with state store and useNavigationState hook"
```

---

## Task 3: GeocodingService

**Files:**
- Create: `example/src/services/GeocodingService.ts`
- Create: `example/__tests__/services/GeocodingService.test.ts`

- [ ] **Step 3.1: Write failing tests**

Create `example/__tests__/services/GeocodingService.test.ts`:

```typescript
import { GeocodingService } from '../../../src/services/GeocodingService';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const PELIAS_RESPONSE = {
  features: [
    {
      geometry: { coordinates: [106.6297, 10.8231] },
      properties: {
        id: 'abc123',
        label: 'The Coffee House, 45 Lê Lợi, District 1, Ho Chi Minh City',
        name: 'The Coffee House',
        county: 'District 1',
        region: 'Ho Chi Minh City',
      },
    },
    {
      geometry: { coordinates: [106.635, 10.828] },
      properties: {
        id: 'def456',
        label: 'Cộng Cà Phê, 26 Lý Tự Trọng',
        name: 'Cộng Cà Phê',
        county: 'District 1',
        region: 'Ho Chi Minh City',
      },
    },
  ],
};

describe('GeocodingService', () => {
  beforeEach(() => mockFetch.mockReset());

  it('returns mapped Place array on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => PELIAS_RESPONSE,
    });

    const results = await GeocodingService.search('coffee', {
      latitude: 10.82,
      longitude: 106.63,
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      id: 'abc123',
      name: 'The Coffee House',
      address: 'The Coffee House, 45 Lê Lợi, District 1, Ho Chi Minh City',
      coordinate: { latitude: 10.8231, longitude: 106.6297 },
    });
    expect(typeof results[0].distanceM).toBe('number');
  });

  it('includes focus point in request URL', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ features: [] }) });

    await GeocodingService.search('test', { latitude: 10.82, longitude: 106.63 });

    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain('focus.point.lat=10.82');
    expect(url).toContain('focus.point.lon=106.63');
    expect(url).toContain('text=test');
  });

  it('returns empty array when API fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const results = await GeocodingService.search('coffee', null);
    expect(results).toEqual([]);
  });

  it('returns empty array on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const results = await GeocodingService.search('coffee', null);
    expect(results).toEqual([]);
  });

  it('returns empty array when query is blank', async () => {
    const results = await GeocodingService.search('  ', null);
    expect(results).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3.2: Run tests — verify they fail**

```bash
cd example
yarn jest __tests__/services/GeocodingService.test.ts --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 3.3: Implement GeocodingService**

Create `example/src/services/GeocodingService.ts`:

```typescript
import { VNMAP_BASE_URL } from '../styles/brand';
import type { LatLng, Place } from './NavigationService';

function haversineDistanceM(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const GeocodingService = {
  async search(query: string, focusPoint: LatLng | null): Promise<Place[]> {
    if (!query.trim()) return [];

    const params = new URLSearchParams({ text: query, size: '5' });
    if (focusPoint) {
      params.set('focus.point.lat', String(focusPoint.latitude));
      params.set('focus.point.lon', String(focusPoint.longitude));
    }

    const url = `${VNMAP_BASE_URL}/pelias/v1/search?${params}`;

    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.features ?? []).map((f: any): Place => {
        const [lng, lat] = f.geometry.coordinates as [number, number];
        const coordinate: LatLng = { latitude: lat, longitude: lng };
        return {
          id: f.properties.id ?? `${lng},${lat}`,
          name: f.properties.name ?? f.properties.label,
          address: f.properties.label,
          coordinate,
          distanceM: focusPoint
            ? Math.round(haversineDistanceM(focusPoint, coordinate))
            : 0,
        };
      });
    } catch {
      return [];
    }
  },
};
```

- [ ] **Step 3.4: Run tests — verify they pass**

```bash
cd example
yarn jest __tests__/services/GeocodingService.test.ts --no-coverage
```

Expected: PASS, 5 tests.

- [ ] **Step 3.5: Commit**

```bash
git add example/src/services/GeocodingService.ts example/__tests__/services/GeocodingService.test.ts
git commit -m "feat: add GeocodingService (Pelias client)"
```

---

## Task 4: RoutingService

**Files:**
- Create: `example/src/services/RoutingService.ts`
- Create: `example/__tests__/services/RoutingService.test.ts`

- [ ] **Step 4.1: Write failing tests**

Create `example/__tests__/services/RoutingService.test.ts`:

```typescript
import { RoutingService } from '../../../src/services/RoutingService';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const OSRM_RESPONSE = {
  routes: [
    {
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.63, 10.82],
          [106.635, 10.825],
          [106.64, 10.83],
        ],
      },
      distance: 1234.5,
      duration: 487.2,
    },
  ],
};

describe('RoutingService', () => {
  beforeEach(() => mockFetch.mockReset());

  it('returns route geometry and meta on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => OSRM_RESPONSE });

    const result = await RoutingService.getRoute(
      { latitude: 10.82, longitude: 106.63 },
      { latitude: 10.83, longitude: 106.64 },
    );

    expect(result).not.toBeNull();
    expect(result!.geometry.type).toBe('LineString');
    expect(result!.geometry.coordinates).toHaveLength(3);
    expect(result!.meta.distanceM).toBe(1235); // rounded
    expect(result!.meta.durationS).toBe(487); // rounded
  });

  it('calls OSRM with lng,lat;lng,lat coordinate order', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => OSRM_RESPONSE });

    await RoutingService.getRoute(
      { latitude: 10.82, longitude: 106.63 },
      { latitude: 10.83, longitude: 106.64 },
    );

    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain('106.63,10.82');
    expect(url).toContain('106.64,10.83');
    expect(url).toContain('geometries=geojson');
  });

  it('returns null when API fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const result = await RoutingService.getRoute(
      { latitude: 10.82, longitude: 106.63 },
      { latitude: 10.83, longitude: 106.64 },
    );
    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network'));
    const result = await RoutingService.getRoute(
      { latitude: 10.82, longitude: 106.63 },
      { latitude: 10.83, longitude: 106.64 },
    );
    expect(result).toBeNull();
  });

  it('returns null when routes array is empty', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ routes: [] }) });
    const result = await RoutingService.getRoute(
      { latitude: 10.82, longitude: 106.63 },
      { latitude: 10.83, longitude: 106.64 },
    );
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 4.2: Run tests — verify they fail**

```bash
cd example
yarn jest __tests__/services/RoutingService.test.ts --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 4.3: Implement RoutingService**

Create `example/src/services/RoutingService.ts`:

```typescript
import { OSRM_BASE_URL } from '../styles/brand';
import type { LatLng, RouteMeta } from './NavigationService';

export interface RouteResult {
  geometry: GeoJSON.LineString;
  meta: RouteMeta;
}

export const RoutingService = {
  async getRoute(
    origin: LatLng,
    destination: LatLng,
  ): Promise<RouteResult | null> {
    const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
    const url = `${OSRM_BASE_URL}/route/v1/driving/${coords}?geometries=geojson&overview=full`;

    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const route = data.routes?.[0];
      if (!route) return null;
      return {
        geometry: route.geometry as GeoJSON.LineString,
        meta: {
          distanceM: Math.round(route.distance),
          durationS: Math.round(route.duration),
        },
      };
    } catch {
      return null;
    }
  },
};
```

- [ ] **Step 4.4: Run tests — verify they pass**

```bash
cd example
yarn jest __tests__/services/RoutingService.test.ts --no-coverage
```

Expected: PASS, 5 tests.

- [ ] **Step 4.5: Commit**

```bash
git add example/src/services/RoutingService.ts example/__tests__/services/RoutingService.test.ts
git commit -m "feat: add RoutingService (OSRM client)"
```

---

## Task 5: LocationService

**Files:**
- Create: `example/src/services/LocationService.ts`

No unit tests — device GPS is not unit-testable. Integration tested by running the app.

- [ ] **Step 5.1: Create LocationService**

Create `example/src/services/LocationService.ts`:

```typescript
import { navigationService } from './NavigationService';

let watchId: number | null = null;

export const LocationService = {
  start(): void {
    if (watchId !== null) return;
    watchId = navigator.geolocation.watchPosition(
      position => {
        navigationService.updateLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      _error => {},
      { enableHighAccuracy: true, distanceFilter: 10 },
    );
  },

  stop(): void {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  },
};
```

- [ ] **Step 5.2: Commit**

```bash
git add example/src/services/LocationService.ts
git commit -m "feat: add LocationService (GPS wrapper)"
```

---

## Task 6: SearchBar Component

**Files:**
- Create: `example/src/components/SearchBar.tsx`

- [ ] **Step 6.1: Create SearchBar**

Create `example/src/components/SearchBar.tsx`:

```typescript
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
```

- [ ] **Step 6.2: Commit**

```bash
git add example/src/components/SearchBar.tsx
git commit -m "feat: add SearchBar pill component"
```

---

## Task 7: PlaceCard Component

**Files:**
- Create: `example/src/components/PlaceCard.tsx`
- Create: `example/__tests__/components/PlaceCard.test.tsx`

- [ ] **Step 7.1: Write failing tests**

Create `example/__tests__/components/PlaceCard.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PlaceCard } from '../../../src/components/PlaceCard';
import type { Place } from '../../../src/services/NavigationService';

const place: Place = {
  id: '1',
  name: 'The Coffee House',
  address: '45 Lê Lợi, Quận 1',
  coordinate: { latitude: 10.82, longitude: 106.63 },
  distanceM: 400,
};

describe('PlaceCard', () => {
  it('renders place name and address', () => {
    const { getByText } = render(
      <PlaceCard place={place} onDirections={jest.fn()} onDismiss={jest.fn()} />,
    );
    expect(getByText('The Coffee House')).toBeTruthy();
    expect(getByText('45 Lê Lợi, Quận 1')).toBeTruthy();
  });

  it('shows distance in km when >= 1000m', () => {
    const farPlace = { ...place, distanceM: 1200 };
    const { getByText } = render(
      <PlaceCard place={farPlace} onDirections={jest.fn()} onDismiss={jest.fn()} />,
    );
    expect(getByText('1.2 km')).toBeTruthy();
  });

  it('shows distance in m when < 1000m', () => {
    const { getByText } = render(
      <PlaceCard place={place} onDirections={jest.fn()} onDismiss={jest.fn()} />,
    );
    expect(getByText('400 m')).toBeTruthy();
  });

  it('calls onDirections when Chỉ đường is pressed', () => {
    const onDirections = jest.fn();
    const { getByText } = render(
      <PlaceCard place={place} onDirections={onDirections} onDismiss={jest.fn()} />,
    );
    fireEvent.press(getByText('🚗  Chỉ đường'));
    expect(onDirections).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when Đóng is pressed', () => {
    const onDismiss = jest.fn();
    const { getByText } = render(
      <PlaceCard place={place} onDirections={jest.fn()} onDismiss={onDismiss} />,
    );
    fireEvent.press(getByText('✕  Đóng'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 7.2: Install @testing-library/react-native if not present**

```bash
cd example
yarn add --dev @testing-library/react-native
```

- [ ] **Step 7.3: Run tests — verify they fail**

```bash
cd example
yarn jest __tests__/components/PlaceCard.test.tsx --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 7.4: Implement PlaceCard**

Create `example/src/components/PlaceCard.tsx`:

```typescript
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
```

- [ ] **Step 7.5: Run tests — verify they pass**

```bash
cd example
yarn jest __tests__/components/PlaceCard.test.tsx --no-coverage
```

Expected: PASS, 5 tests.

- [ ] **Step 7.6: Commit**

```bash
git add example/src/components/PlaceCard.tsx example/__tests__/components/PlaceCard.test.tsx
git commit -m "feat: add PlaceCard bottom-sheet component"
```

---

## Task 8: RouteOverlay Component

**Files:**
- Create: `example/src/components/RouteOverlay.tsx`
- Create: `example/__tests__/components/RouteOverlay.test.tsx`

- [ ] **Step 8.1: Write failing tests**

Create `example/__tests__/components/RouteOverlay.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RouteOverlay } from '../../../src/components/RouteOverlay';

const route: GeoJSON.LineString = {
  type: 'LineString',
  coordinates: [[106.63, 10.82], [106.64, 10.83]],
};
const meta = { distanceM: 1200, durationS: 480 };

describe('RouteOverlay', () => {
  it('shows duration in minutes', () => {
    const { getByText } = render(
      <RouteOverlay route={route} meta={meta} onCancel={jest.fn()} />,
    );
    expect(getByText('8 phút')).toBeTruthy();
  });

  it('shows distance in km', () => {
    const { getByText } = render(
      <RouteOverlay route={route} meta={meta} onCancel={jest.fn()} />,
    );
    expect(getByText('1.2 km')).toBeTruthy();
  });

  it('calls onCancel when Hủy is pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <RouteOverlay route={route} meta={meta} onCancel={onCancel} />,
    );
    fireEvent.press(getByText('✕ Hủy'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('rounds up partial minutes', () => {
    const { getByText } = render(
      <RouteOverlay route={route} meta={{ distanceM: 500, durationS: 61 }} onCancel={jest.fn()} />,
    );
    expect(getByText('2 phút')).toBeTruthy();
  });
});
```

- [ ] **Step 8.2: Run tests — verify they fail**

```bash
cd example
yarn jest __tests__/components/RouteOverlay.test.tsx --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 8.3: Implement RouteOverlay**

Create `example/src/components/RouteOverlay.tsx`:

```typescript
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
      {/* Route line drawn on map */}
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
```

- [ ] **Step 8.4: Run tests — verify they pass**

```bash
cd example
yarn jest __tests__/components/RouteOverlay.test.tsx --no-coverage
```

Expected: PASS, 4 tests.

- [ ] **Step 8.5: Commit**

```bash
git add example/src/components/RouteOverlay.tsx example/__tests__/components/RouteOverlay.test.tsx
git commit -m "feat: add RouteOverlay component (route line + info banner)"
```

---

## Task 9: MapScreen

**Files:**
- Create: `example/src/screens/MapScreen.tsx`

- [ ] **Step 9.1: Create MapScreen**

Create `example/src/screens/MapScreen.tsx`:

```typescript
import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Map,
  Camera,
  type CameraRef,
  UserLocation,
  GeoJSONSource,
  Layer,
  Marker,
} from '@maplibre/maplibre-react-native';
import { useNavigation } from '@react-navigation/native';

import { VNMAP_STYLE } from '../styles/brand';
import { useNavigationState, navigationService } from '../services/NavigationService';
import { LocationService } from '../services/LocationService';
import { RoutingService } from '../services/RoutingService';
import { SearchBar } from '../components/SearchBar';
import { PlaceCard } from '../components/PlaceCard';
import { RouteOverlay } from '../components/RouteOverlay';

export function MapScreen() {
  const navigation = useNavigation<any>();
  const cameraRef = useRef<CameraRef>(null);
  const state = useNavigationState();

  useEffect(() => {
    LocationService.start();
    return () => LocationService.stop();
  }, []);

  useEffect(() => {
    if (state.currentLocation) {
      cameraRef.current?.flyTo({
        center: [state.currentLocation.longitude, state.currentLocation.latitude],
        zoom: 15,
        duration: 1000,
      });
    }
  }, [state.currentLocation?.latitude, state.currentLocation?.longitude]);

  const handleDirections = useCallback(async () => {
    if (!state.selectedPlace || !state.currentLocation) return;
    const result = await RoutingService.getRoute(
      state.currentLocation,
      state.selectedPlace.coordinate,
    );
    if (result) {
      navigationService.setActiveRoute(result.geometry, result.meta);
    }
  }, [state.selectedPlace, state.currentLocation]);

  const handleDismissPlace = useCallback(() => {
    navigationService.clearPlace();
  }, []);

  const handleCancelRoute = useCallback(() => {
    navigationService.clearRoute();
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Map
        style={StyleSheet.absoluteFillObject}
        mapStyle={VNMAP_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Camera
          ref={cameraRef}
          zoom={13}
          centerCoordinate={[106.6297, 10.8231]}
        />
        <UserLocation visible />

        {state.activeRoute && (
          <GeoJSONSource id="route-source" data={state.activeRoute}>
            <Layer
              id="route-line"
              type="line"
              style={{ lineColor: '#00b8d4', lineWidth: 4, lineJoin: 'round', lineCap: 'round' }}
            />
          </GeoJSONSource>
        )}

        {state.selectedPlace && (
          <Marker
            coordinate={[
              state.selectedPlace.coordinate.longitude,
              state.selectedPlace.coordinate.latitude,
            ]}
          >
            <View style={styles.destPin} />
          </Marker>
        )}
      </Map>

      {!state.activeRoute && (
        <SearchBar onPress={() => navigation.navigate('Search')} />
      )}

      {state.selectedPlace && !state.activeRoute && (
        <PlaceCard
          place={state.selectedPlace}
          onDirections={handleDirections}
          onDismiss={handleDismissPlace}
        />
      )}

      {state.activeRoute && state.routeMeta && (
        <RouteOverlay
          route={state.activeRoute}
          meta={state.routeMeta}
          onCancel={handleCancelRoute}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  destPin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1de9b6',
    borderWidth: 2.5,
    borderColor: '#fff',
    shadowColor: '#1de9b6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
});
```

- [ ] **Step 9.2: Commit**

```bash
git add example/src/screens/MapScreen.tsx
git commit -m "feat: add MapScreen (full-screen map home)"
```

---

## Task 10: SearchScreen

**Files:**
- Create: `example/src/screens/SearchScreen.tsx`
- Create: `example/__tests__/components/SearchScreen.test.tsx`

- [ ] **Step 10.1: Write failing tests**

Create `example/__tests__/components/SearchScreen.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SearchScreen } from '../../../src/screens/SearchScreen';
import { navigationService } from '../../../src/services/NavigationService';
import { GeocodingService } from '../../../src/services/GeocodingService';

jest.mock('../../../src/services/GeocodingService', () => ({
  GeocodingService: { search: jest.fn() },
}));

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

const mockSearch = GeocodingService.search as jest.Mock;

describe('SearchScreen', () => {
  beforeEach(() => {
    mockSearch.mockReset();
    mockGoBack.mockReset();
    navigationService.reset();
  });

  it('renders search input', () => {
    const { getByPlaceholderText } = render(<SearchScreen />);
    expect(getByPlaceholderText('Tìm kiếm địa điểm...')).toBeTruthy();
  });

  it('shows results when search returns places', async () => {
    mockSearch.mockResolvedValueOnce([
      {
        id: '1',
        name: 'The Coffee House',
        address: '45 Lê Lợi, Q1',
        coordinate: { latitude: 10.82, longitude: 106.63 },
        distanceM: 400,
      },
    ]);

    const { getByPlaceholderText, findByText } = render(<SearchScreen />);
    fireEvent.changeText(getByPlaceholderText('Tìm kiếm địa điểm...'), 'coffee');

    expect(await findByText('The Coffee House')).toBeTruthy();
  });

  it('calls goBack and selectPlace when result is tapped', async () => {
    const place = {
      id: '1',
      name: 'The Coffee House',
      address: '45 Lê Lợi, Q1',
      coordinate: { latitude: 10.82, longitude: 106.63 },
      distanceM: 400,
    };
    mockSearch.mockResolvedValueOnce([place]);

    const { getByPlaceholderText, findByText } = render(<SearchScreen />);
    fireEvent.changeText(getByPlaceholderText('Tìm kiếm địa điểm...'), 'coffee');

    const item = await findByText('The Coffee House');
    fireEvent.press(item);

    expect(navigationService.getState().selectedPlace).toEqual(place);
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 10.2: Run tests — verify they fail**

```bash
cd example
yarn jest __tests__/components/SearchScreen.test.tsx --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 10.3: Implement SearchScreen**

Create `example/src/screens/SearchScreen.tsx`:

```typescript
import React, { useState, useCallback, useEffect } from 'react';
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

  const doSearch = useCallback(
    debounce(async (text: string) => {
      if (!text.trim()) { setResults([]); return; }
      const found = await GeocodingService.search(text, state.currentLocation);
      setResults(found);
    }, 300),
    [state.currentLocation],
  );

  useEffect(() => {
    doSearch(query);
  }, [query, doSearch]);

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
```

- [ ] **Step 10.4: Run tests — verify they pass**

```bash
cd example
yarn jest __tests__/components/SearchScreen.test.tsx --no-coverage
```

Expected: PASS, 3 tests.

- [ ] **Step 10.5: Commit**

```bash
git add example/src/screens/SearchScreen.tsx example/__tests__/components/SearchScreen.test.tsx
git commit -m "feat: add SearchScreen with Pelias autocomplete"
```

---

## Task 11: Wire App.tsx — Replace Old Navigator

**Files:**
- Create: `example/src/App.tsx` (replaces `App.js`)
- Delete: `example/src/scenes/GroupAndItem.tsx`, `example/src/scenes/ScreenWithoutMap.tsx`

- [ ] **Step 11.1: Create new App.tsx**

Create `example/src/App.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MapLibreGL from '@maplibre/maplibre-react-native';

import { MapScreen } from './screens/MapScreen';
import { SearchScreen } from './screens/SearchScreen';

MapLibreGL.setAccessToken(null);

const Stack = createNativeStackNavigator();

export default function App() {
  const [permissionGranted, setPermissionGranted] = useState(
    Platform.OS !== 'android',
  );
  const [checkingPermission, setCheckingPermission] = useState(
    Platform.OS === 'android',
  );

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    navigator.geolocation.requestAuthorization?.();
    // React Native's Geolocation polyfill handles permissions via watchPosition
    setPermissionGranted(true);
    setCheckingPermission(false);
  }, []);

  if (checkingPermission) return null;

  if (!permissionGranted) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Vui lòng cấp quyền truy cập vị trí để sử dụng ứng dụng.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false, gestureEnabled: false }}
        >
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{ presentation: 'modal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f7f9fb',
  },
  errorText: {
    fontSize: 16,
    color: '#1a2332',
    textAlign: 'center',
  },
});
```

- [ ] **Step 11.2: Update root index.js to use App.tsx**

Open `example/index.js`. It should already re-export from `./src/App` — if it references `App.js` specifically, update to:

```javascript
import App from './src/App';
export default App;
```

- [ ] **Step 11.3: Delete old scene files**

```bash
rm example/src/scenes/GroupAndItem.tsx
rm example/src/scenes/ScreenWithoutMap.tsx
```

- [ ] **Step 11.4: Run all tests**

```bash
cd example
yarn jest --no-coverage
```

Expected: All previously written tests PASS. Verify no regressions.

- [ ] **Step 11.5: Type-check**

```bash
cd example
yarn type:check
```

Fix any type errors before committing.

- [ ] **Step 11.6: Commit**

```bash
git add example/src/App.tsx example/index.js
git rm example/src/scenes/GroupAndItem.tsx example/src/scenes/ScreenWithoutMap.tsx
git commit -m "feat: wire App.tsx with MapScreen + SearchScreen navigator, remove example list"
```

---

## Task 12: Smoke-Test on Device

This task is manual — run the app and verify the golden path.

- [ ] **Step 12.1: Run on Android**

```bash
cd example
yarn android
```

- [ ] **Step 12.2: Verify golden path**

1. App opens to full-screen map (OSM street tiles from vnMap)
2. Blue dot appears at your location
3. Tap search pill → SearchScreen slides up as modal
4. Type a place name → results appear (Pelias autocomplete)
5. Tap a result → PlaceCard bottom sheet slides up with name, address, distance
6. Tap "Chỉ đường" → route line drawn on map, info banner appears at top
7. Tap "✕ Hủy" → route clears, back to map with PlaceCard visible
8. Tap "✕ Đóng" on PlaceCard → back to bare map

- [ ] **Step 12.3: Commit final note**

```bash
git commit --allow-empty -m "test: Phase 1 smoke-tested on device — golden path verified"
```

---

## Notes for Phase 2 (Android Auto)

Phase 2 is a separate plan. Prerequisites before starting:
- Phase 1 must be complete and merged
- `NavigationService` API must be stable (no breaking changes)
- Android DHU (Desktop Head Unit) installed for testing

Phase 2 will add:
- `NativeNavigationModule.kt` — bridge exposing `NavigationService` state to Kotlin
- `CarNavigationAppService.kt` — `CarAppService` entry point
- `CarMapScreen.kt`, `CarSearchScreen.kt`, `CarRouteScreen.kt`
- `AndroidManifest.xml` changes for Auto metadata
