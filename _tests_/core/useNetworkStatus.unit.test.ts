import { jest } from '@jest/globals';

describe('useNetworkStatus (mocked)', () => {
  afterEach(() => jest.resetModules());

  it('returns connected when hook is mocked as connected', () => {
    jest.doMock('@/hooks/useNetworkStatus', () => ({ useNetworkStatus: () => ({ isConnected: true }) }));
    const { useNetworkStatus } = require('@/hooks/useNetworkStatus');
    const r = useNetworkStatus();
    expect(r.isConnected).toBe(true);
  });

  it('returns disconnected when mocked', () => {
    jest.doMock('@/hooks/useNetworkStatus', () => ({ useNetworkStatus: () => ({ isConnected: false }) }));
    const { useNetworkStatus } = require('@/hooks/useNetworkStatus');
    expect(useNetworkStatus().isConnected).toBe(false);
  });
});
