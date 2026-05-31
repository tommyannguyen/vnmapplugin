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
