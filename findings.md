# Findings — Street Names / Building Names / Place Labels

> Research for the label enrichment task. Date: 2026-03-01

---

## What the current style renders

`buildVectorTileStyle` (in both `vmapPlugin.ts` and `vmapPluginModule.ts`) has:

**Geometry layers** (no labels):
- background, landcover, landuse-park, landuse-residential
- water (fill), waterway (line)
- road-motorway, road-trunk, road-primary, road-secondary, road-minor (line)
- building (fill)
- boundary (line)

**Label layers** (symbol):
- `place-city` — cities only (zoom 8+)
- `place-town` — towns and villages (zoom 10+)

**Missing labels**:
- ❌ Street / road names
- ❌ Building names
- ❌ Suburb / neighbourhood / hamlet names
- ❌ Country / state names (low-zoom context)
- ❌ POI names (shops, amenities, tourism)
- ❌ River / waterway names
- ❌ Lake / water body names
- ❌ Airport names

---

## OpenMapTiles Schema — Key Source Layers for Labels

### `transportation_name` (road name labels)

This is a **separate source layer** from `transportation`. Planetiler emits road name
label geometry (points/linestrings placed along roads) into this layer.

Key properties:
- `name` — local name
- `name:vi` — Vietnamese name (relevant for Vietnam data)
- `name:latin` — romanised name
- `class` — motorway | trunk | primary | secondary | tertiary | minor | service

Text field expression: `['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']]`
Symbol placement: `'line'` (follows road direction)

### `place` (all named places)

Classes available in Vietnam OSM data:
- `country` — minzoom ~3
- `state` — minzoom ~5
- `city` — minzoom 8 (already rendered)
- `town` — minzoom 10 (already rendered)
- `village` — minzoom 10 (already rendered as part of town layer)
- `suburb` — minzoom 12
- `quarter` — minzoom 13
- `neighbourhood` — minzoom 13
- `hamlet` — minzoom 13
- `isolated_dwelling` — minzoom 14

### `poi` (points of interest)

Key properties:
- `name`, `name:vi`, `name:latin`
- `class` — food_drink | shop | attraction | park | religion | ...
- `subclass` — restaurant | cafe | supermarket | ...

Visible at minzoom 14. No sprite sheet needed for text-only rendering.

### `water_name` (water body names)

- Point or polygon centroid geometry
- Properties: `name`, `name:vi`, `class` (lake | bay | sea | ocean | river)
- minzoom 10 for lakes, 5 for oceans/seas

### `waterway` (existing layer — add name label)

The existing `waterway` line layer renders river/stream geometry.
A separate symbol layer on the same source-layer with `symbol-placement: line`
will render river names alongside the waterway lines.

### `building` (existing layer — add name label)

The existing `building` fill layer renders building footprints.
A separate symbol layer on the same source-layer with `has(name)` filter
renders named buildings (schools, hospitals, malls, etc.) at zoom 16+.

### `aerodrome_label` (airports)

- Point layer with airport names
- Properties: `name`, `name:vi`, `iata`, `class` (international | regional | ...)
- minzoom 10

---

## Font Availability

Martin serves fonts from `./data/fonts/`. Currently confirmed:
- `Noto Sans Bold` — confirmed via fc-query (previous session)
- `Noto Sans Regular` — confirmed via fc-query (previous session)

Both fonts are required for the new label layers. No additional fonts needed.

---

## Glyphs URL

The `glyphsUrl` parameter defaults to `https://fonts.openmaptiles.org/{fontstack}/{range}.pbf`.
In production (with Martin font proxy), it's overridden to
`http://localhost:5000/api/map/font/{fontstack}/{range}.pbf?apiKey=...`.

Both URLs serve the same SDF glyph ranges. The label layers use `['Noto Sans Bold']` or
`['Noto Sans Regular']` which match the font names available in both sources.

---

## Implementation Notes

1. **Layer ordering matters**: Symbol layers must come after fill/line geometry layers so
   labels render on top. Road name labels should come after road line layers.

2. **`symbol-placement: line`** causes Mapbox GL JS to repeat the label along the road
   at intervals — this is the correct OSM-like behaviour.

3. **`text-allow-overlap: false`** (default) means the engine auto-deconflicts labels —
   no manual placement needed.

4. **Building name filter**: Use `['has', 'name']` to skip buildings without a name
   (the vast majority). Without this filter, the engine wastes cycles on unnamed buildings.

5. **POI icon sprites**: Skipping for now. Sprite sheets require a separate setup
   (Martin does not serve sprites). Text-only POI labels work without sprites.

6. **Vietnam-specific**: `name:vi` takes priority. If absent, falls back to `name:latin`
   then `name`. This matches OSM rendering conventions for Vietnam.
