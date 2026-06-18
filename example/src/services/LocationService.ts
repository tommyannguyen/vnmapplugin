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
      { enableHighAccuracy: true, distanceFilter: 10 } as PositionOptions,
    );
  },

  stop(): void {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  },
};
