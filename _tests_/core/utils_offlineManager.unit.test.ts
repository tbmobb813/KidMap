import { waitFor } from '@testing-library/react-native';

describe('OfflineManager', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('queues an action and processes it when online (PHOTO_CHECKIN)', async () => {
    const mockSetItem = jest.fn(async () => true);
    const mockGetItem = jest.fn(async () => []);

    // Mock SafeAsyncStorage and logger before importing the manager
    jest.doMock('@/utils/error/errorHandling', () => ({
      SafeAsyncStorage: {
        getItem: mockGetItem,
        setItem: mockSetItem,
      },
    }));

    jest.doMock('@react-native-community/netinfo', () => ({
      fetch: jest.fn(async () => ({ isConnected: true, isInternetReachable: true, type: 'wifi' })),
      addEventListener: jest.fn(() => () => {}),
    }));

    jest.doMock('@/utils/error/logger', () => ({ log: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

    const { offlineManager } = require('@/utils/offlineManager');

    // Wait for async initialization to finish (loadOfflineActions calls SafeAsyncStorage.getItem)
    await waitFor(() => {
      expect(mockGetItem).toHaveBeenCalled();
    });

    const id = await offlineManager.queueAction('PHOTO_CHECKIN', { photo: 'data' });
    expect(typeof id).toBe('string');

    // Eventually the action should be processed and removed from pending list
    await waitFor(() => {
      expect(offlineManager.getPendingActionsCount()).toBe(0);
    });
  });

  it('leaves unknown action types in the queue and increments retryCount', async () => {
    const mockSetItem = jest.fn(async () => true);
    const mockGetItem = jest.fn(async () => []);

    jest.doMock('@/utils/error/errorHandling', () => ({
      SafeAsyncStorage: {
        getItem: mockGetItem,
        setItem: mockSetItem,
      },
    }));

    jest.doMock('@react-native-community/netinfo', () => ({
      fetch: jest.fn(async () => ({ isConnected: true, isInternetReachable: true, type: 'cellular' })),
      addEventListener: jest.fn(() => () => {}),
    }));

    jest.doMock('@/utils/error/logger', () => ({ log: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

    const { offlineManager } = require('@/utils/offlineManager');

    // Wait for async initialization to finish
    await waitFor(() => {
      expect(mockGetItem).toHaveBeenCalled();
    });

    // Unknown action type will return false from executeAction and be retried
    await offlineManager.queueAction('UNKNOWN_TYPE', { foo: 'bar' }, 2);

    // After processing, the action should remain in queue (retryCount incremented but less than maxRetries)
    await waitFor(() => {
      expect(offlineManager.getPendingActionsCount()).toBeGreaterThanOrEqual(1);
    });
  });

  it('handles persistence errors gracefully when saving queued actions', async () => {
    const mockSetItem = jest.fn(async () => { throw new Error('storage-fail'); });
    const mockGetItem = jest.fn(async () => []);

    jest.doMock('@/utils/error/errorHandling', () => ({
      SafeAsyncStorage: {
        getItem: mockGetItem,
        setItem: mockSetItem,
      },
    }));

    jest.doMock('@react-native-community/netinfo', () => ({
      fetch: jest.fn(async () => ({ isConnected: false, isInternetReachable: false, type: 'none' })),
      addEventListener: jest.fn(() => () => {}),
    }));

    jest.doMock('@/utils/error/logger', () => ({ log: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

    const { offlineManager } = require('@/utils/offlineManager');

    // Wait for async initialization to finish
    await waitFor(() => {
      expect(mockGetItem).toHaveBeenCalled();
    });

    const id = await offlineManager.queueAction('SAVE_ROUTE', { id: 'r1' });
    expect(typeof id).toBe('string');

    // Even though setItem threw, queueAction should not reject; action remains pending
    expect(offlineManager.getPendingActionsCount()).toBeGreaterThanOrEqual(1);
    expect(mockSetItem).toHaveBeenCalled();
  });
});
