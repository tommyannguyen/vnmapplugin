export const LineJoin = {
  Bevel: 'bevel',
  Round: 'round',
  Miter: 'miter',
};

export const StyleURL = {
  Street: 'mapbox://styles/mapbox/streets-v11',
  Satellite: 'mapbox://styles/mapbox/satellite-v9',
};

// No-op: token is not required when using self-hosted vector tiles via Martin
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setAccessToken = (_token: string) => {};

/**
 * Build a Mapbox GL style for OpenMapTiles-schema vector tiles (served by Martin).
 * Uses glyphs from the public OpenMapTiles font server for place labels.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildVectorTileStyle(
  tileUrl: string,
  minZoom: number,
  maxZoom: number,
  attribution: string,
  glyphsUrl = 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
): any {
  return {
    version: 8,
    glyphs: glyphsUrl,
    sources: {
      openmaptiles: {
        type: 'vector',
        tiles: [tileUrl],
        minzoom: minZoom,
        maxzoom: maxZoom,
        attribution,
      },
    },
    layers: [
      // --- Geometry layers (fill / line) ---
      { id: 'background', type: 'background', paint: { 'background-color': '#f2efe9' } },
      { id: 'landcover', type: 'fill', source: 'openmaptiles', 'source-layer': 'landcover',
        paint: { 'fill-color': '#d8ead8', 'fill-opacity': 0.6 } },
      { id: 'landuse-park', type: 'fill', source: 'openmaptiles', 'source-layer': 'landuse',
        filter: ['match', ['get', 'class'], ['park', 'grass', 'garden', 'village_green', 'recreation_ground'], true, false],
        paint: { 'fill-color': '#aad3a4', 'fill-opacity': 0.7 } },
      { id: 'landuse-residential', type: 'fill', source: 'openmaptiles', 'source-layer': 'landuse',
        filter: ['==', ['get', 'class'], 'residential'],
        paint: { 'fill-color': '#e8e0d8', 'fill-opacity': 0.5 } },
      { id: 'water', type: 'fill', source: 'openmaptiles', 'source-layer': 'water',
        paint: { 'fill-color': '#a0c8f0' } },
      { id: 'waterway', type: 'line', source: 'openmaptiles', 'source-layer': 'waterway',
        paint: { 'line-color': '#a0c8f0', 'line-width': 1.5 } },
      
      // --- ENHANCED ROAD VISIBILITY WITH DISTINCT COLORS ---
      // Major highways - Bright orange
      { 
        id: 'road-motorway', 
        type: 'line', 
        source: 'openmaptiles', 
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'motorway'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 
          'line-color': '#E35F00',
          'line-width': ['interpolate', ['linear'], ['zoom'], 
            6, 1.5,
            10, 3.5, 
            14, 12,
            18, 18
          ],
          'line-opacity': 0.95
        } 
      },
      // Motorway casing
      { 
        id: 'road-motorway-casing', 
        type: 'line', 
        source: 'openmaptiles', 
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'motorway'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 
          'line-color': '#8B3A00',
          'line-width': ['interpolate', ['linear'], ['zoom'], 
            6, 2.2,
            10, 4.5, 
            14, 14,
            18, 20
          ],
          'line-opacity': 0.6
        } 
      },

      // Trunk roads - Medium brown
      { 
        id: 'road-trunk', 
        type: 'line', 
        source: 'openmaptiles', 
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'trunk'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 
          'line-color': '#C17B3A',
          'line-width': ['interpolate', ['linear'], ['zoom'], 
            6, 1.2,
            10, 3, 
            14, 10,
            18, 16
          ],
          'line-opacity': 0.9
        } 
      },

      // Primary roads - Warm golden yellow
      { 
        id: 'road-primary', 
        type: 'line', 
        source: 'openmaptiles', 
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'primary'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 
          'line-color': '#F7C46C',
          'line-width': ['interpolate', ['linear'], ['zoom'], 
            8, 1,
            12, 3, 
            16, 8,
            18, 14
          ],
          'line-opacity': 0.9
        } 
      },

      // Secondary roads - Soft green
      { 
        id: 'road-secondary', 
        type: 'line', 
        source: 'openmaptiles', 
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'secondary'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 
          'line-color': '#9BC16C',
          'line-width': ['interpolate', ['linear'], ['zoom'], 
            10, 0.8,
            13, 2.5, 
            16, 6,
            19, 10
          ],
          'line-opacity': 0.85
        } 
      },
      // Secondary roads casing
      { 
        id: 'road-secondary-casing', 
        type: 'line', 
        source: 'openmaptiles', 
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'secondary'],
        minzoom: 12,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 
          'line-color': '#5A7D3A',
          'line-width': ['interpolate', ['linear'], ['zoom'], 
            12, 2,
            14, 4, 
            17, 8,
            19, 12
          ],
          'line-opacity': 0.5
        } 
      },

      // Tertiary roads - Soft blue
      { 
        id: 'road-tertiary', 
        type: 'line', 
        source: 'openmaptiles', 
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'tertiary'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 
          'line-color': '#7AA5C0',
          'line-width': ['interpolate', ['linear'], ['zoom'], 
            11, 0.8,
            14, 2.5, 
            17, 5,
            19, 8
          ],
          'line-opacity': 0.85
        } 
      },

      // Minor roads - Blue-gray
      { 
        id: 'road-minor', 
        type: 'line', 
        source: 'openmaptiles', 
        'source-layer': 'transportation',
        filter: ['match', ['get', 'class'], ['minor', 'service'], true, false],
        minzoom: 12,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 
          'line-color': '#B0BEC5',
          'line-width': ['interpolate', ['linear'], ['zoom'], 
            12, 0.8,
            15, 2, 
            18, 4,
            20, 6
          ],
          'line-opacity': 0.8
        } 
      },

      // Tracks/paths - Warm gray
      { 
        id: 'road-track', 
        type: 'line', 
        source: 'openmaptiles', 
        'source-layer': 'transportation',
        filter: ['match', ['get', 'class'], ['track', 'path'], true, false],
        minzoom: 13,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 
          'line-color': '#C0B0A0',
          'line-width': ['interpolate', ['linear'], ['zoom'], 
            13, 0.6,
            16, 1.5, 
            19, 3,
            21, 4
          ],
          'line-opacity': 0.7,
          'line-dasharray': [2, 2] // Dashed lines for paths
        } 
      },
      
      { id: 'building', type: 'fill', source: 'openmaptiles', 'source-layer': 'building',
        minzoom: 14,
        paint: { 'fill-color': '#d8d0c8', 'fill-outline-color': '#c0b8b0', 'fill-opacity': 0.8 } },
      { id: 'boundary', type: 'line', source: 'openmaptiles', 'source-layer': 'boundary',
        paint: { 'line-color': '#9e9cab', 'line-width': 1, 'line-dasharray': [3, 3] } },

      // --- ENHANCED ROAD NAME LABELS ---
      { 
        id: 'road-name-motorway', 
        type: 'symbol', 
        source: 'openmaptiles', 
        'source-layer': 'transportation_name',
        minzoom: 9,
        filter: ['match', ['get', 'class'], ['motorway', 'trunk'], true, false],
        layout: {
          'symbol-placement': 'line',
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 9, 10, 14, 14, 18, 18],
          'text-max-width': 10,
          'text-letter-spacing': 0.05,
        },
        paint: { 
          'text-color': '#FFFFFF', 
          'text-halo-color': '#E35F00', 
          'text-halo-width': 2,
          'text-halo-blur': 1
        } 
      },
      
      { 
        id: 'road-name-primary', 
        type: 'symbol', 
        source: 'openmaptiles', 
        'source-layer': 'transportation_name',
        minzoom: 10,
        filter: ['==', ['get', 'class'], 'primary'],
        layout: {
          'symbol-placement': 'line',
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 10, 10, 14, 13, 18, 16],
          'text-max-width': 10,
        },
        paint: { 
          'text-color': '#333333', 
          'text-halo-color': '#F7C46C', 
          'text-halo-width': 2 
        } 
      },
      
      { 
        id: 'road-name-secondary', 
        type: 'symbol', 
        source: 'openmaptiles', 
        'source-layer': 'transportation_name',
        minzoom: 11,
        filter: ['==', ['get', 'class'], 'secondary'],
        layout: {
          'symbol-placement': 'line',
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 11, 9, 14, 12, 17, 15],
          'text-max-width': 8,
        },
        paint: { 
          'text-color': '#333333', 
          'text-halo-color': '#9BC16C', 
          'text-halo-width': 2 
        } 
      },
      
      { 
        id: 'road-name-tertiary', 
        type: 'symbol', 
        source: 'openmaptiles', 
        'source-layer': 'transportation_name',
        minzoom: 12,
        filter: ['==', ['get', 'class'], 'tertiary'],
        layout: {
          'symbol-placement': 'line',
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 12, 9, 15, 11, 18, 13],
          'text-max-width': 8,
        },
        paint: { 
          'text-color': '#333333', 
          'text-halo-color': '#7AA5C0', 
          'text-halo-width': 1.8 
        } 
      },
      
      { 
        id: 'road-name-minor', 
        type: 'symbol', 
        source: 'openmaptiles', 
        'source-layer': 'transportation_name',
        minzoom: 13,
        filter: ['match', ['get', 'class'], ['minor', 'service'], true, false],
        layout: {
          'symbol-placement': 'line',
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 13, 9, 16, 11, 19, 13],
          'text-max-width': 8,
        },
        paint: { 
          'text-color': '#444444', 
          'text-halo-color': '#F0F0F0', 
          'text-halo-width': 1.8 
        } 
      },

      { id: 'waterway-name', type: 'symbol', source: 'openmaptiles', 'source-layer': 'waterway',
        minzoom: 13,
        layout: {
          'symbol-placement': 'line',
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': 10,
          'text-max-width': 8,
        },
        paint: { 'text-color': '#4a90d9', 'text-halo-color': 'rgba(255,255,255,0.8)', 'text-halo-width': 1.5 } },
      { id: 'water-name', type: 'symbol', source: 'openmaptiles', 'source-layer': 'water_name',
        minzoom: 10,
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 10, 10, 14, 14],
          'text-max-width': 8,
        },
        paint: { 'text-color': '#4a90d9', 'text-halo-color': 'rgba(255,255,255,0.8)', 'text-halo-width': 1.5 } },
      { id: 'aerodrome-label', type: 'symbol', source: 'openmaptiles', 'source-layer': 'aerodrome_label',
        minzoom: 10,
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Bold'],
          'text-size': 11,
          'text-max-width': 10,
        },
        paint: { 'text-color': '#333366', 'text-halo-color': 'rgba(255,255,255,0.8)', 'text-halo-width': 1.5 } },
      { id: 'place-country', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place',
        minzoom: 3, maxzoom: 8,
        filter: ['==', ['get', 'class'], 'country'],
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 3, 10, 8, 16],
          'text-max-width': 10,
        },
        paint: { 'text-color': '#222222', 'text-halo-color': 'rgba(255,255,255,0.8)', 'text-halo-width': 1.5 } },
      { id: 'place-state', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place',
        minzoom: 5, maxzoom: 10,
        filter: ['match', ['get', 'class'], ['state', 'province', 'region'], true, false],
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 5, 10, 10, 14],
          'text-max-width': 10,
        },
        paint: { 'text-color': '#333333', 'text-halo-color': 'rgba(255,255,255,0.8)', 'text-halo-width': 1.5 } },
      { id: 'place-city', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place',
        filter: ['==', ['get', 'class'], 'city'],
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 10, 14, 16],
          'text-max-width': 10,
        },
        paint: { 'text-color': '#333333', 'text-halo-color': 'rgba(255,255,255,0.8)', 'text-halo-width': 1.5 } },
      { id: 'place-town', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place',
        filter: ['match', ['get', 'class'], ['town', 'village'], true, false],
        minzoom: 10,
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 10, 10, 14, 14],
          'text-max-width': 10,
        },
        paint: { 'text-color': '#555555', 'text-halo-color': 'rgba(255,255,255,0.8)', 'text-halo-width': 1.5 } },
      { id: 'place-suburb', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place',
        minzoom: 12,
        filter: ['match', ['get', 'class'], ['suburb', 'quarter'], true, false],
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 12, 10, 16, 14],
          'text-max-width': 8,
        },
        paint: { 'text-color': '#666666', 'text-halo-color': 'rgba(255,255,255,0.8)', 'text-halo-width': 1 } },
      { id: 'place-neighbourhood', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place',
        minzoom: 13,
        filter: ['match', ['get', 'class'], ['neighbourhood', 'hamlet', 'isolated_dwelling'], true, false],
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': 10,
          'text-max-width': 8,
        },
        paint: { 'text-color': '#777777', 'text-halo-color': 'rgba(255,255,255,0.8)', 'text-halo-width': 1 } },
      { id: 'poi-label', type: 'symbol', source: 'openmaptiles', 'source-layer': 'poi',
        minzoom: 14,
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': 10,
          'text-max-width': 8,
          'text-anchor': 'top',
          'text-offset': [0, 0.5],
        },
        paint: { 'text-color': '#444444', 'text-halo-color': 'rgba(255,255,255,0.9)', 'text-halo-width': 1 } },
      { id: 'building-name', type: 'symbol', source: 'openmaptiles', 'source-layer': 'building',
        minzoom: 16,
        filter: ['has', 'name'],
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name:latin'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': 10,
          'text-max-width': 8,
        },
        paint: { 'text-color': '#666666', 'text-halo-color': 'rgba(255,255,255,0.9)', 'text-halo-width': 1 } },
    ],
  };
}

// Create and export the plugin module
const vmapPluginModule = {
  LineJoin,
  StyleURL,
  setAccessToken,
  buildVectorTileStyle,
};

export default vmapPluginModule;