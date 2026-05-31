jest.mock('@maplibre/maplibre-react-native', () => ({
  Map: 'Map',
  Camera: 'Camera',
  UserLocation: 'UserLocation',
  GeoJSONSource: 'GeoJSONSource',
  Layer: 'Layer',
  Marker: 'Marker',
  RasterSource: 'RasterSource',
  LogManager: { setLogLevel: jest.fn() },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));
