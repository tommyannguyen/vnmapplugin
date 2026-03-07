# Task Plan — Show Street Names, Building Names & All Place Labels

> Created: 2026-03-01 (new task — replaces previous Martin integration plan)

## Goal

Extend `buildVectorTileStyle` so the Martin-served map displays labels comparable to
OpenStreetMap:
1. **Street / road names** along roads at appropriate zoom levels
2. **Building names** at high zoom
3. **All place classes** — city, town, village, suburb, hamlet, neighbourhood, quarter
4. **POI labels** — amenities, shops, tourism, etc.
5. **Water names** — rivers, lakes
6. **Aerodrome labels** — airports

Both files that contain `buildVectorTileStyle` must stay in sync:
- `frontend/src/lib/vmapPlugin.ts`
- `plugin/src/web/vmapPluginModule.ts`

---

## OpenMapTiles Source-Layer Reference

| Source layer          | What it contains                                 |
|-----------------------|--------------------------------------------------|
| `transportation`      | Road geometry (line) — already rendered          |
| `transportation_name` | Road name label geometry (line) — **missing**    |
| `building`            | Building polygons — fill already; name **missing** |
| `place`               | Cities, towns, villages, suburbs, etc.           |
| `poi`                 | Points of interest (amenities, shops, tourism)   |
| `water_name`          | Lake / sea / ocean names (point + polygon)       |
| `waterway`            | River/stream lines — already rendered; name **missing** |
| `aerodrome_label`     | Airport point labels — **missing**               |
| `mountain_peak`       | Mountain peak points — optional                  |

---

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | Add road/street name labels (`transportation_name`) | pending |
| 2 | Add expanded place labels (suburb, hamlet, neighbourhood) | pending |
| 3 | Add building name labels (`building` where name exists) | pending |
| 4 | Add POI labels (`poi`) | pending |
| 5 | Add water names (`water_name`, `waterway` name) | pending |
| 6 | Add aerodrome labels (`aerodrome_label`) | pending |
| 7 | Sync changes to `plugin/src/web/vmapPluginModule.ts` | pending |

---

## Phase 1 — Street / Road Name Labels

**Source layer**: `transportation_name`
**Layer type**: `symbol` with `'symbol-placement': 'line'`

New layers to insert **after** the road line layers and **before** place labels:

```
road-name-motorway   minzoom:10  filter: class=motorway|trunk
road-name-primary    minzoom:11  filter: class=primary
road-name-secondary  minzoom:12  filter: class=secondary|tertiary
road-name-minor      minzoom:14  filter: class=minor|service
```

Text field: `['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']]`
Font: `['Noto Sans Regular']` for all road names
Text size: small (10–12px), follows road line direction

**Files**: `vmapPlugin.ts`, `vmapPluginModule.ts`

---

## Phase 2 — Expanded Place Labels

**Source layer**: `place`

Classes currently missing:
- `suburb`, `quarter`, `neighbourhood` → minzoom 13–15
- `hamlet`, `isolated_dwelling` → minzoom 13
- `country`, `state` → minzoom 3–7

Layers to add (after existing `place-town`):

```
place-country          minzoom:3   filter: class=country
place-state            minzoom:5   filter: class=state|province
place-suburb           minzoom:12  filter: class=suburb|quarter
place-neighbourhood    minzoom:13  filter: class=neighbourhood|hamlet
```

---

## Phase 3 — Building Name Labels

**Source layer**: `building`
Only render when `name` property is set (many buildings have no name).

```
building-name          minzoom:16  filter: has(name)
```

Font: `['Noto Sans Regular']`, size 10px, grey color, white halo

---

## Phase 4 — POI Labels

**Source layer**: `poi`

Show at minzoom 14. Include icon-less text-only label (icon sprites require sprite sheet).

```
poi-label              minzoom:14
```

Text field: `['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']]`
Color: #444, halo white, size 10–12

---

## Phase 5 — Water Names

**Waterway names** (`waterway` source layer, rivers):
```
waterway-name          minzoom:13  symbol-placement: line
```

**Water body names** (`water_name` source layer, lakes/sea):
```
water-name             minzoom:10  symbol-placement: point
```

Text color: #4a90d9 (blue), halo white

---

## Phase 6 — Aerodrome Labels

**Source layer**: `aerodrome_label`

```
aerodrome-label        minzoom:10
```

Text: name:vi / name:latin / name
Font: Noto Sans Bold, size 11

---

## Phase 7 — Sync to Plugin Module

Mirror all changes from `frontend/src/lib/vmapPlugin.ts` into
`plugin/src/web/vmapPluginModule.ts` (identical layers array).

---

## Layer Order (final)

```
background
landcover
landuse-park
landuse-residential
water                  ← fill
waterway               ← line
road-motorway
road-trunk
road-primary
road-secondary
road-minor
building               ← fill
boundary
[NEW] road-name-motorway
[NEW] road-name-primary
[NEW] road-name-secondary
[NEW] road-name-minor
[NEW] waterway-name
[NEW] water-name
[NEW] aerodrome-label
[NEW] place-country
[NEW] place-state
place-city
place-town
[NEW] place-suburb
[NEW] place-neighbourhood
[NEW] poi-label
[NEW] building-name
```

Labels are rendered last so they appear on top of geometry.

---

## Acceptance Criteria

- [ ] Street names visible on roads at zoom 12+
- [ ] Major road names (motorway/primary) visible at zoom 10+
- [ ] Suburb/neighbourhood names appear at zoom 13+
- [ ] Building names show at zoom 16+ where data exists
- [ ] POI labels appear at zoom 14+
- [ ] River names follow waterway lines at zoom 13+
- [ ] Lake/sea names appear at zoom 10+
- [ ] Airport names appear at zoom 10+
- [ ] Both `vmapPlugin.ts` and `vmapPluginModule.ts` are identical

---

## Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Use `transportation_name` not `transportation` for road labels | OpenMapTiles schema has a dedicated label layer with label geometry | 2026-03-01 |
| `symbol-placement: line` for road names | Makes text follow road direction like OSM | 2026-03-01 |
| Skip icon sprites for POI | No sprite sheet configured; text-only labels are reliable | 2026-03-01 |
| Add country/state labels | Low-zoom context is missing from current style | 2026-03-01 |
