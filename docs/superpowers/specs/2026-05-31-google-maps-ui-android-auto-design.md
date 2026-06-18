# NcA Map — Google Maps-style UI + Android Auto Design Spec

**Date:** 2026-05-31  
**Status:** Approved for implementation  
**Phases:** 2 (Phone UI first, Android Auto second)

---

## 1. Overview

Redesign the `example/` app from a developer feature-list showcase into a production-quality navigation app styled after Google Maps. The app targets:

- **Phone (Android/iOS):** Full-screen map, search, place cards, visual route display
- **Android Auto:** Standalone car head-unit interface (search + navigate from car screen)

The existing example list is replaced entirely. The map IS the home screen.

---

## 2. Brand & Visual Design

Derived from the NcA logo (`logo.png`) and the light street map reference (`image.png`).

| Token | Value | Usage |
|---|---|---|
| Primary | `#00b8d4` (cyan) | Buttons, active states, user dot, distances |
| Secondary | `#1de9b6` (mint) | Destination pins, route line, secondary actions |
| Background | `#f7f9fb` | Map base tint |
| Surface | `#ffffff` | Cards, sheets, panels |
| Text primary | `#1a2332` | Headings, place names |
| Text secondary | `#8899aa` | Subtitles, metadata |

**Design language:** Light street map (OpenStreetMap style), white cards with drop shadows, brand colors as accents only. Glassmorphism is NOT used on the phone app (Android Auto uses dark panels per Auto guidelines). UI copy is Vietnamese (`Tìm kiếm`, `Chỉ đường`, `Hủy`).

---

## 3. Technology Stack Changes

### Map SDK

| Before | After |
|---|---|
| `@rnmapbox/maps` (requires Mapbox token) | `@maplibre/maplibre-react-native` (no token needed) |

MapLibre Native is the open-source fork of Mapbox GL with an identical API. It supports raster XYZ tile sources, GeoJSON overlays, and user location — everything needed.

### External Services

| Service | Provider | Endpoint |
|---|---|---|
| Map tiles | vnMap (OSM-based) | `https://vnmap.tinhocanhminh.com.vn/api/map/styles/1/tile/{z}/{x}/{y}.png` |
| Geocoding / Search | Pelias on vnMap server | `https://vnmap.tinhocanhminh.com.vn/pelias/v1/search?text=…` |
| Routing | OSRM (public) | `https://router.project-osrm.org/route/v1/driving/{lng,lat};{lng,lat}?geometries=geojson` |
| API Key | vnMap | `Op1TSPFL5a6ekOoW` (sent as `Authorization: Bearer` header) |

> **Note:** The Pelias endpoint path should be verified against the docker-compose config before implementation. Fallback: `https://api.geocode.earth/v1/search` (free tier) if Pelias is not yet exposed.

---

## 4. Architecture

### 4.1 Shared NavigationService

A pure-TypeScript singleton that owns all navigation state. Both the phone UI and Android Auto consume it.

```
GPS (device) → LocationService → NavigationService ← GeocodingService (Pelias)
                                         ↓              ← RoutingService (OSRM)
                        ┌────────────────┴────────────────┐
                   Phone UI (RN)                    Auto Bridge (Kotlin↔JS)
                   MapScreen                         CarMapScreen
                   SearchScreen                      CarSearchScreen
                   PlaceCard                         CarRouteScreen
                   RouteOverlay
```

**State shape:**

```typescript
interface NavigationState {
  currentLocation: LatLng | null;       // live GPS
  searchQuery: string;                  // current search text
  searchResults: Place[];               // Pelias results
  selectedPlace: Place | null;          // drives PlaceCard
  activeRoute: GeoJSON.LineString | null; // OSRM geometry to draw
  routeMeta: { distanceM: number; durationS: number } | null;
}
```

**Methods:** `search(query)`, `selectPlace(place)`, `requestRoute(origin, dest)`, `clearRoute()`, `updateLocation(coords)`

### 4.2 Services

- **LocationService** — wraps `@react-native-community/geolocation`, emits position updates to NavigationService
- **GeocodingService** — `GET /pelias/v1/search?text=…&focus.point.lat=…&focus.point.lon=…` → transforms response to `Place[]`
- **RoutingService** — `GET /route/v1/driving/…` on OSRM → extracts GeoJSON LineString + distance/duration

### 4.3 Native Bridge (Phase 2)

`NativeNavigationModule` (Kotlin) exposes NavigationService state to the CarApp layer via `ReactApplicationContext`. The Auto screens call `getState()` and `dispatch(action)` through this module.

---

## 5. Phone App Screens

### 5.1 MapScreen (Home)

Replaces the current `Group`/`Item` navigation stack entirely. Entry point is `AppContainer` → `MapScreen`.

- Full-screen `MapLibre MapView` with OSM raster tile source
- Light street map style (`image.png` reference)
- Cyan user location dot with glow ring
- Search pill (white, rounded, shadow) pinned top — taps navigate to SearchScreen
- Penguin avatar 🐧 in search pill right side (brand identity)
- Compass button top-right (white card)
- "My location" FAB bottom-right (white card, cyan icon)
- No headers, no back button — map IS the root

### 5.2 SearchScreen

Slides up over MapScreen (modal stack).

- Dark-bordered text input with back arrow
- Autocomplete list: GeocodingService called on each keystroke (debounced 300ms)
- Each result row: colored icon badge (cyan/mint alternating), place name, sub-address, distance in cyan
- Tap result → `NavigationService.selectPlace(place)` → dismiss SearchScreen → PlaceCard appears

### 5.3 PlaceCard (Bottom Sheet overlay on MapScreen)

Renders inside MapScreen, not a separate screen.

- Slides up from bottom when `NavigationState.selectedPlace !== null`
- White card, drag handle, place icon badge, name, sub-address, distance badge
- **"Chỉ đường" button** — cyan→mint gradient, calls `RoutingService` then shows RouteOverlay
- **"Đóng" button** — ghost, clears selectedPlace
- Destination pin (mint, glowing) drops on map at selected place

### 5.4 RouteOverlay (Overlay on MapScreen)

Renders inside MapScreen when `NavigationState.activeRoute !== null`.

- Draws GeoJSON LineString on map (cyan→mint gradient stroke, 4px, glow shadow)
- Origin marker: cyan user dot
- Destination marker: mint pin with glow ring
- Top banner (white card): duration in minutes (cyan, bold), distance + via-street (gray), red "Hủy" button
- Tap "Hủy" → `NavigationService.clearRoute()`

---

## 6. Android Auto Screens

Android Auto mandates dark backgrounds and large touch targets for driving safety.

### 6.1 CarMapScreen (Home)

- MapLibre surface rendered via `SurfaceCallback` (dark map style for Auto)
- Top bar: NcA brand pill (penguin + "NcA MAP"), city name, live speed (from GPS)
- Right panel (130px): "Tìm kiếm" primary button (cyan→mint gradient), "Vị trí của tôi" secondary button, Settings button at bottom
- Side panel syncs with NavigationService via NativeNavigationModule

### 6.2 CarSearchScreen

- CarApp `SearchTemplate`
- Text input with Auto OS keyboard
- Results list: large rows (48dp+), place name bold, sub-address, distance right-aligned in cyan
- Tap result → dispatches `selectPlace` to NavigationService → navigates to CarRouteScreen

### 6.3 CarRouteScreen

- Map surface with route drawn (cyan line, origin dot, mint destination pin)
- Right panel: destination name, address, duration (large, cyan bold), distance + via
- **"Bắt đầu" button** (cyan→mint gradient, full width) — confirms route, stays on map showing it
- **"Hủy" button** (ghost) — clears route, returns to CarMapScreen
- Route state written to NavigationService → phone reflects same route

---

## 7. File Structure

New files marked `✦`, modified marked `~`.

```
example/
  package.json                    ~ add @maplibre/maplibre-react-native
  src/
    App.tsx                        ~ replace navigator with MapScreen root
    screens/
      MapScreen.tsx                ✦ home screen
      SearchScreen.tsx             ✦ search + autocomplete
    components/
      PlaceCard.tsx                ✦ bottom sheet
      RouteOverlay.tsx             ✦ route line + banner
      SearchBar.tsx                ✦ pill component
    services/
      NavigationService.ts         ✦ state store
      LocationService.ts           ✦ GPS wrapper
      GeocodingService.ts          ✦ Pelias client
      RoutingService.ts            ✦ OSRM client
    styles/
      brand.ts                     ✦ color tokens

  android/app/src/main/java/…/
    CarNavigationAppService.kt     ✦ CarAppService entry point
    CarMapScreen.kt                ✦
    CarSearchScreen.kt             ✦
    CarRouteScreen.kt              ✦
    NativeNavigationModule.kt      ✦ JS↔Kotlin bridge

  android/app/src/main/
    AndroidManifest.xml            ~ add CarAppService + Auto metadata
```

Files removed: `src/scenes/GroupAndItem.tsx`, `src/scenes/ScreenWithoutMap.tsx`, `src/examples/common/MapHeader.tsx` (replaced by brand header in MapScreen), all example group imports from `App.tsx`.

---

## 8. Implementation Phases

### Phase 1 — Phone App (React Native only)

1. Install `@maplibre/maplibre-react-native`, remove `@rnmapbox/maps` from example
2. Create brand token file (`brand.ts`)
3. Build `NavigationService` + `LocationService` + `GeocodingService` + `RoutingService`
4. Build `SearchBar`, `PlaceCard`, `RouteOverlay` components
5. Build `MapScreen` (home) and `SearchScreen`
6. Wire `App.tsx` to use `MapScreen` as root
7. Remove old example list navigator

### Phase 2 — Android Auto

1. Add CarApp Library dependency to `android/app/build.gradle`
2. Implement `NativeNavigationModule` (Kotlin↔JS bridge)
3. Implement `CarMapScreen` with MapLibre surface rendering
4. Implement `CarSearchScreen` + `CarRouteScreen`
5. Register `CarNavigationAppService` in `AndroidManifest.xml`
6. Test with Android Desktop Head Unit (DHU)

---

## 9. Out of Scope

- Turn-by-turn voice guidance (Phase 1 & 2)
- Step-by-step maneuver banners
- Traffic layer
- Offline maps
- iOS CarPlay
- The existing developer example list (removed)
