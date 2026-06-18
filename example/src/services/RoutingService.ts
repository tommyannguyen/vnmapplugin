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
