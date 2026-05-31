import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Map,
  Camera,
  type CameraRef,
  UserLocation,
  GeoJSONSource,
  Layer,
  Marker,
} from '@maplibre/maplibre-react-native';
import { useNavigation } from '@react-navigation/native';

import { VNMAP_STYLE } from '../styles/brand';
import { useNavigationState, navigationService } from '../services/NavigationService';
import { LocationService } from '../services/LocationService';
import { RoutingService } from '../services/RoutingService';
import { SearchBar } from '../components/SearchBar';
import { PlaceCard } from '../components/PlaceCard';
import { RouteOverlay } from '../components/RouteOverlay';

export function MapScreen() {
  const navigation = useNavigation<any>();
  const cameraRef = useRef<CameraRef>(null);
  const state = useNavigationState();

  useEffect(() => {
    LocationService.start();
    return () => LocationService.stop();
  }, []);

  const hasCenteredRef = useRef(false);
  useEffect(() => {
    if (state.currentLocation && !hasCenteredRef.current) {
      hasCenteredRef.current = true;
      cameraRef.current?.flyTo({
        center: [state.currentLocation.longitude, state.currentLocation.latitude],
        zoom: 15,
        duration: 1000,
      });
    }
  }, [state.currentLocation?.latitude, state.currentLocation?.longitude]);

  const handleDirections = useCallback(async () => {
    if (!state.selectedPlace || !state.currentLocation) return;
    const result = await RoutingService.getRoute(
      state.currentLocation,
      state.selectedPlace.coordinate,
    );
    if (result) {
      navigationService.setActiveRoute(result.geometry, result.meta);
    }
  }, [state.selectedPlace, state.currentLocation]);

  const handleDismissPlace = useCallback(() => {
    navigationService.clearPlace();
  }, []);

  const handleCancelRoute = useCallback(() => {
    navigationService.clearRoute();
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Map
        style={StyleSheet.absoluteFillObject}
        mapStyle={VNMAP_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Camera
          ref={cameraRef}
          zoom={13}
          center={[106.6297, 10.8231]}
        />
        <UserLocation visible />

        {state.activeRoute && (
          <GeoJSONSource id="route-source" data={state.activeRoute}>
            <Layer
              id="route-line"
              type="line"
              paint={{ 'line-color': '#00b8d4', 'line-width': 4 }}
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
            />
          </GeoJSONSource>
        )}

        {state.selectedPlace && (
          <Marker
            lngLat={[
              state.selectedPlace.coordinate.longitude,
              state.selectedPlace.coordinate.latitude,
            ]}
          >
            <View style={styles.destPin} />
          </Marker>
        )}
      </Map>

      {!state.activeRoute && (
        <SearchBar onPress={() => navigation.navigate('Search')} />
      )}

      {state.selectedPlace && !state.activeRoute && (
        <PlaceCard
          place={state.selectedPlace}
          onDirections={handleDirections}
          onDismiss={handleDismissPlace}
        />
      )}

      {state.activeRoute && state.routeMeta && (
        <RouteOverlay
          meta={state.routeMeta}
          onCancel={handleCancelRoute}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  destPin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1de9b6',
    borderWidth: 2.5,
    borderColor: '#fff',
    shadowColor: '#1de9b6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
});
