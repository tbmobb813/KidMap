const React = require('react');

/**
 * Minimal isolated tests for useSafeZoneMonitor (JS version to avoid TS parsing issues in jest transform).
 */

describe('useSafeZoneMonitor (unit)', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns API and reports null when no location', async () => {
    let api = null;

    jest.isolateModules(() => {
      jest.doMock('@/stores/parentalStore', () => ({ useParentalStore: () => ({ safeZones: [], settings: { safeZoneAlerts: true }, dashboardData: { safeZoneActivity: [] }, saveDashboardData: jest.fn() }) }));
      jest.doMock('expo-location', () => ({ requestForegroundPermissionsAsync: jest.fn(), requestBackgroundPermissionsAsync: jest.fn(), getCurrentPositionAsync: jest.fn(), watchPositionAsync: jest.fn(), Accuracy: { Balanced: 'balanced' } }));
      jest.doMock('@/utils/notification/notification', () => ({ requestNotificationPermission: jest.fn(), showNotification: jest.fn() }));

      const { useSafeZoneMonitor } = require('@/hooks/useSafeZoneMonitor');
      const renderer = require('react-test-renderer');
      const ReactReq = require('react');

      const TestComp = ({ onReady }) => {
        const apiLocal = useSafeZoneMonitor();
        ReactReq.useEffect(() => {
          if (onReady) onReady(apiLocal);
        }, [apiLocal, onReady]);
        return null;
      };

      renderer.create(ReactReq.createElement(TestComp, { onReady: (a) => (api = a) }));
    });

    // wait for the TestComp to set the api
    await new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if (api != null) return resolve();
        if (Date.now() - start > 2000) return reject(new Error('timeout'));
        setTimeout(tick, 10);
      };
      tick();
    });

    expect(api).not.toBeNull();
    expect(api.getCurrentSafeZoneStatus()).toBeNull();
  });

  it.skip('startMonitoring triggers notification and save when inside an active zone', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    const mockShow = jest.fn().mockResolvedValue(undefined);

    const zone = { id: 'z1', name: 'Home', latitude: 12.34, longitude: 56.78, radius: 10000, isActive: true, notifications: { onEntry: true, onExit: true } };

    let api = null;

    jest.isolateModules(() => {
      jest.doMock('@/stores/parentalStore', () => ({ useParentalStore: () => ({ safeZones: [zone], settings: { safeZoneAlerts: true }, dashboardData: { safeZoneActivity: [] }, saveDashboardData: mockSave }) }));
      const mockGetCurrent = jest.fn().mockResolvedValue({ coords: { latitude: 12.34, longitude: 56.78 } });
      const mockRequestForeground = jest.fn().mockResolvedValue({ status: 'granted' });
      const mockRequestBackground = jest.fn().mockResolvedValue({ status: 'granted' });
      const mockWatch = jest.fn().mockResolvedValue({ remove: jest.fn() });
      jest.doMock('expo-location', () => ({ requestForegroundPermissionsAsync: mockRequestForeground, requestBackgroundPermissionsAsync: mockRequestBackground, getCurrentPositionAsync: mockGetCurrent, watchPositionAsync: mockWatch, Accuracy: { Balanced: 'balanced' } }));
      jest.doMock('@/utils/notification/notification', () => ({ requestNotificationPermission: jest.fn().mockResolvedValue(undefined), showNotification: mockShow }));

      const { useSafeZoneMonitor } = require('@/hooks/useSafeZoneMonitor');
      const renderer = require('react-test-renderer');
      const ReactReq = require('react');

      const TestComp = ({ onReady }) => {
        const apiLocal = useSafeZoneMonitor();
        ReactReq.useEffect(() => onReady && onReady(apiLocal), [apiLocal, onReady]);
        return null;
      };

      renderer.create(ReactReq.createElement(TestComp, { onReady: (a) => (api = a) }));
    });

    // wait for the TestComp to set the api
    await new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if (api != null) return resolve();
        if (Date.now() - start > 2000) return reject(new Error('timeout'));
        setTimeout(tick, 10);
      };
      tick();
    });

    expect(api).not.toBeNull();
    await api.startMonitoring();

    // Poll for status to become available (startMonitoring triggers async checks)
    await new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        try {
          const status = api.getCurrentSafeZoneStatus();
          if (status != null) return resolve(status);
        } catch (e) {
          // ignore
        }
        if (Date.now() - start > 2000) return reject(new Error('timeout waiting for status'));
        setTimeout(tick, 20);
      };
      tick();
    });

    const status = api.getCurrentSafeZoneStatus();
    expect(status).not.toBeNull();
    expect(status.inside.length).toBeGreaterThanOrEqual(1);
    expect(mockShow).toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalled();
    api.stopMonitoring();
  });
});
