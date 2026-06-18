import { VNMAP_BASE_URL, VNMAP_API_KEY } from '../styles/brand';
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
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${VNMAP_API_KEY}`,
        },
      });
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
