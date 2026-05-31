jest.mock('@maplibre/maplibre-react-native', () => ({
  MapView: 'MapView',
  Camera: 'Camera',
  UserLocation: 'UserLocation',
  ShapeSource: 'ShapeSource',
  LineLayer: 'LineLayer',
  MarkerView: 'MarkerView',
  setAccessToken: jest.fn(),
  Logger: { setLogLevel: jest.fn() },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));
