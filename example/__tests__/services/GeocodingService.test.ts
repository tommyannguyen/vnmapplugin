import { GeocodingService } from '../../src/services/GeocodingService';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const PELIAS_RESPONSE = {
  features: [
    {
      geometry: { coordinates: [106.6297, 10.8231] },
      properties: {
        id: 'abc123',
        label: 'The Coffee House, 45 Lê Lợi, District 1, Ho Chi Minh City',
        name: 'The Coffee House',
        county: 'District 1',
        region: 'Ho Chi Minh City',
      },
    },
    {
      geometry: { coordinates: [106.635, 10.828] },
      properties: {
        id: 'def456',
        label: 'Cộng Cà Phê, 26 Lý Tự Trọng',
        name: 'Cộng Cà Phê',
        county: 'District 1',
        region: 'Ho Chi Minh City',
      },
    },
  ],
};

describe('GeocodingService', () => {
  beforeEach(() => mockFetch.mockReset());

  it('returns mapped Place array on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => PELIAS_RESPONSE,
    });

    const results = await GeocodingService.search('coffee', {
      latitude: 10.82,
      longitude: 106.63,
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      id: 'abc123',
      name: 'The Coffee House',
      address: 'The Coffee House, 45 Lê Lợi, District 1, Ho Chi Minh City',
      coordinate: { latitude: 10.8231, longitude: 106.6297 },
    });
    expect(typeof results[0].distanceM).toBe('number');
  });

  it('includes focus point in request URL', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ features: [] }) });

    await GeocodingService.search('test', { latitude: 10.82, longitude: 106.63 });

    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain('focus.point.lat=10.82');
    expect(url).toContain('focus.point.lon=106.63');
    expect(url).toContain('text=test');
  });

  it('returns empty array when API fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const results = await GeocodingService.search('coffee', null);
    expect(results).toEqual([]);
  });

  it('returns empty array on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const results = await GeocodingService.search('coffee', null);
    expect(results).toEqual([]);
  });

  it('returns empty array when query is blank', async () => {
    const results = await GeocodingService.search('  ', null);
    expect(results).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
