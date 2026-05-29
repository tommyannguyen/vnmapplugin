jest.mock('@vnmapplugin/maps', () => ({
  StyleURL: {
    Satellite: 'mapbox://styles/mapbox/satellite-v9',
  },
  Logger: {
    setLogLevel: jest.fn(),
  },
  MarkerView: jest.fn(),
}));
