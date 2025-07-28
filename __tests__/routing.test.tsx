// routing.test.tsx

import { fetchRoute } from '@/utils/api';

const mockRoute = {
  legs: [
    {
      summary: '',
      steps: [{ from: 'A', to: 'B', type: 'walk', duration: 600 }],
      distance: 0,
      duration: 600,
    },
  ],
  distance: 0,
  duration: 600,
  geometry: {},
  mode: 'walking',
};

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('Routing and Navigation', () => {
  it('should fetch a route for walking mode', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({ routes: [mockRoute] }),
    } as any);

    const route = await fetchRoute([0, 0], [1, 1], 'walking');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(route).toEqual(mockRoute);
  });

  it('should fetch a route for cycling mode', async () => {
    const cyclingRoute = { ...mockRoute, mode: 'cycling' };

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({ routes: [cyclingRoute] }),
    } as any);

    const route = await fetchRoute([0, 0], [1, 1], 'cycling');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(route).toEqual(cyclingRoute);
  });

  it('should handle empty route responses gracefully', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({ routes: [] }),
    } as any);

    const route = await fetchRoute([0, 0], [1, 1], 'walking');

    expect(route).toBeNull();
  });

  it('should handle fetch errors gracefully', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const route = await fetchRoute([0, 0], [1, 1], 'walking');
    expect(route).toBeNull();
  });
});
