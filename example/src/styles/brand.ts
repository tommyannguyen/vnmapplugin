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
