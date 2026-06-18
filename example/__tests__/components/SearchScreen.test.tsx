import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SearchScreen } from '../../src/screens/SearchScreen';
import { navigationService } from '../../src/services/NavigationService';
import { GeocodingService } from '../../src/services/GeocodingService';

jest.mock('../../src/services/GeocodingService', () => ({
  GeocodingService: { search: jest.fn() },
}));

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

const mockSearch = GeocodingService.search as jest.Mock;

describe('SearchScreen', () => {
  beforeEach(() => {
    mockSearch.mockReset();
    mockGoBack.mockReset();
    navigationService.reset();
  });

  it('renders search input', () => {
    const { getByPlaceholderText } = render(<SearchScreen />);
    expect(getByPlaceholderText('Tìm kiếm địa điểm...')).toBeTruthy();
  });

  it('shows results when search returns places', async () => {
    mockSearch.mockResolvedValueOnce([
      {
        id: '1',
        name: 'The Coffee House',
        address: '45 Lê Lợi, Q1',
        coordinate: { latitude: 10.82, longitude: 106.63 },
        distanceM: 400,
      },
    ]);

    const { getByPlaceholderText, findByText } = render(<SearchScreen />);
    fireEvent.changeText(getByPlaceholderText('Tìm kiếm địa điểm...'), 'coffee');

    expect(await findByText('The Coffee House')).toBeTruthy();
  });

  it('calls goBack and selectPlace when result is tapped', async () => {
    const place = {
      id: '1',
      name: 'The Coffee House',
      address: '45 Lê Lợi, Q1',
      coordinate: { latitude: 10.82, longitude: 106.63 },
      distanceM: 400,
    };
    mockSearch.mockResolvedValueOnce([place]);

    const { getByPlaceholderText, findByText } = render(<SearchScreen />);
    fireEvent.changeText(getByPlaceholderText('Tìm kiếm địa điểm...'), 'coffee');

    const item = await findByText('The Coffee House');
    fireEvent.press(item);

    expect(navigationService.getState().selectedPlace).toEqual(place);
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
