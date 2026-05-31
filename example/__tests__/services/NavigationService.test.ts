import {
  navigationService,
  useNavigationState,
} from '../../src/services/NavigationService';

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
    const geo = { type: 'LineString' as const, coordinates: [[106.63, 10.82]] as [number, number][] };
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
