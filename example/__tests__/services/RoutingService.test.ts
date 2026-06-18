import { RoutingService } from '../../src/services/RoutingService';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const OSRM_RESPONSE = {
  routes: [
    {
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.63, 10.82],
          [106.635, 10.825],
          [106.64, 10.83],
        ],
      },
      distance: 1234.5,
      duration: 487.2,
    },
  ],
};

describe('RoutingService', () => {
  beforeEach(() => mockFetch.mockReset());

  it('returns route geometry and meta on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => OSRM_RESPONSE });

    const result = await RoutingService.getRoute(
      { latitude: 10.82, longitude: 106.63 },
      { latitude: 10.83, longitude: 106.64 },
    );

    expect(result).not.toBeNull();
    expect(result!.geometry.type).toBe('LineString');
    expect(result!.geometry.coordinates).toHaveLength(3);
    expect(result!.meta.distanceM).toBe(1235); // rounded
    expect(result!.meta.durationS).toBe(487); // rounded
  });

  it('calls OSRM with lng,lat;lng,lat coordinate order', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => OSRM_RESPONSE });

    await RoutingService.getRoute(
      { latitude: 10.82, longitude: 106.63 },
      { latitude: 10.83, longitude: 106.64 },
    );

    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain('106.63,10.82');
    expect(url).toContain('106.64,10.83');
    expect(url).toContain('geometries=geojson');
  });

  it('returns null when API fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const result = await RoutingService.getRoute(
      { latitude: 10.82, longitude: 106.63 },
      { latitude: 10.83, longitude: 106.64 },
    );
    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network'));
    const result = await RoutingService.getRoute(
      { latitude: 10.82, longitude: 106.63 },
      { latitude: 10.83, longitude: 106.64 },
    );
    expect(result).toBeNull();
  });

  it('returns null when routes array is empty', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ routes: [] }) });
    const result = await RoutingService.getRoute(
      { latitude: 10.82, longitude: 106.63 },
      { latitude: 10.83, longitude: 106.64 },
    );
    expect(result).toBeNull();
  });
});
