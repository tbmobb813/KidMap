import { TransitDataUpdater } from '@/utils/transit/transitDataUpdater';

// Mock the region store used internally
jest.mock('@/stores/regionStore', () => ({
  useRegionStore: {
    getState: () => ({
      availableRegions: [
        {
          id: 'r1',
          name: 'Region 1',
          transitSystems: [
            { id: 's1', name: 'Sys1', routes: ['A', 'B'] },
          ],
        },
      ],
      updateRegionTransitData: jest.fn(),
    }),
  },
}));

describe('TransitDataUpdater', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('updateRegionTransitData returns success for known region by mocking fetch', async () => {
    const updater = TransitDataUpdater.getInstance();

    // Mock fetchTransitData to avoid timeouts and randomness
    const mockResponse = {
      routes: [{ systemId: 's1', id: 's1-A' }],
      schedules: [],
      alerts: [],
      lastModified: new Date().toISOString(),
    };

    jest.spyOn(TransitDataUpdater.prototype as any, 'fetchTransitData').mockResolvedValue(mockResponse);

    const res = await updater.updateRegionTransitData('r1');
    expect(res.success).toBe(true);
    expect(res.regionId).toBe('r1');
  });

  test('updateRegionTransitData returns failure for unknown region', async () => {
    const updater = TransitDataUpdater.getInstance();
    const res = await updater.updateRegionTransitData('missing');

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/not found/i);
  });
});
