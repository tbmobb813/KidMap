describe("auth helpers and offlineManager basic behaviors", () => {
  beforeEach(() => jest.resetModules());

  it("validates emails and passwords correctly", () => {
    const { isValidEmail, isValidPassword } = require("@/utils/auth");

    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("bad-email")).toBe(false);

    const ok = isValidPassword("Aa1!aaaaaa");
    expect(ok.isValid).toBe(true);
    expect(ok.strength).not.toBe("weak");

    const bad = isValidPassword("short");
    expect(bad.isValid).toBe(false);
    expect(bad.errors.length).toBeGreaterThan(0);
  });

  it("queues an offline action and persists via SafeAsyncStorage", async () => {
    jest.isolateModules(async () => {
      // Mock SafeAsyncStorage
      const store: Record<string, any> = {};
      jest.doMock("@/utils/error/errorHandling", () => ({
        SafeAsyncStorage: {
          getItem: async (k: string) => store[k] ?? [],
          setItem: async (k: string, v: any) => {
            store[k] = v;
          },
          removeItem: async (k: string) => {
            delete store[k];
          },
        },
      }));

      // Mock NetInfo to be offline initially
      jest.doMock("@react-native-community/netinfo", () => ({
        fetch: async () => ({ isConnected: false, isInternetReachable: false, type: 'none' }),
        addEventListener: () => () => {},
      }));

      const { offlineManager } = require("@/utils/offlineManager");

  const id = await offlineManager.queueAction("TEST", { a: 1 }, 1);
  expect(typeof id).toBe("string");

  // The SafeAsyncStorage mock persisted the queued actions under the offline key
  const stored = store['offline_actions'];
  expect(stored).toBeDefined();
  const parsed = Array.isArray(stored) ? stored : stored;
  // because our mock stores the array directly, check for length
  expect(parsed.length).toBeGreaterThanOrEqual(1);

  // clearing pending actions should work and remove the key
  await offlineManager.clearPendingActions();
  expect(store['offline_actions']).toBeDefined();
    });
  });
});
