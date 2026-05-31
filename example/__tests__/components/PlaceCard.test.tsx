import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PlaceCard } from '../../src/components/PlaceCard';
import type { Place } from '../../src/services/NavigationService';

const place: Place = {
  id: '1',
  name: 'The Coffee House',
  address: '45 Lê Lợi, Quận 1',
  coordinate: { latitude: 10.82, longitude: 106.63 },
  distanceM: 400,
};

describe('PlaceCard', () => {
  it('renders place name and address', () => {
    const { getByText } = render(
      <PlaceCard place={place} onDirections={jest.fn()} onDismiss={jest.fn()} />,
    );
    expect(getByText('The Coffee House')).toBeTruthy();
    expect(getByText('45 Lê Lợi, Quận 1')).toBeTruthy();
  });

  it('shows distance in km when >= 1000m', () => {
    const farPlace = { ...place, distanceM: 1200 };
    const { getByText } = render(
      <PlaceCard place={farPlace} onDirections={jest.fn()} onDismiss={jest.fn()} />,
    );
    expect(getByText('1.2 km')).toBeTruthy();
  });

  it('shows distance in m when < 1000m', () => {
    const { getByText } = render(
      <PlaceCard place={place} onDirections={jest.fn()} onDismiss={jest.fn()} />,
    );
    expect(getByText('400 m')).toBeTruthy();
  });

  it('calls onDirections when Chỉ đường is pressed', () => {
    const onDirections = jest.fn();
    const { getByText } = render(
      <PlaceCard place={place} onDirections={onDirections} onDismiss={jest.fn()} />,
    );
    fireEvent.press(getByText('🚗  Chỉ đường'));
    expect(onDirections).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when Đóng is pressed', () => {
    const onDismiss = jest.fn();
    const { getByText } = render(
      <PlaceCard place={place} onDirections={jest.fn()} onDismiss={onDismiss} />,
    );
    fireEvent.press(getByText('✕  Đóng'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
