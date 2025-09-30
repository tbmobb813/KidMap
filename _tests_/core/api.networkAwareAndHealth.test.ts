describe("api helpers: network-aware wrapper and health check", () => {
  beforeEach(() => jest.resetModules());

  it("createNetworkAwareApi falls back to cache when network fails", async () => {
    jest.isolateModules(async () => {
      // Provide an AsyncStorage entry that represents a cached ApiResponse
      const store: Record<string, string> = {};
      const cachedResponse = { success: true, data: { cached: true } };
      store[`cache_someKey`] = JSON.stringify({ data: cachedResponse, timestamp: Date.now() });

      jest.doMock("@react-native-async-storage/async-storage", () => ({
        getItem: async (k: string) => store[k] ?? null,
        setItem: async (k: string, v: string) => {
          store[k] = v;
        },
        removeItem: async (k: string) => delete store[k],
        getAllKeys: async () => Object.keys(store),
        multiRemove: async (keys: string[]) => keys.forEach((k) => delete store[k]),
      }));

      // Ensure network request throws
      global.fetch = jest.fn().mockImplementation(() => {
        throw new Error("network down");
      });

      const { createNetworkAwareApi } = require("@/utils/api/api");

      const failingApi = async () => {
        throw new Error("network down");
      };

      const wrapped = createNetworkAwareApi(failingApi, "someKey", 1000);

      const res = await wrapped();

      expect(res).toBeDefined();
      expect((res as any).message).toContain("cached");
    });
  });

  it("checkBackendHealth returns 'down' on fetch error and 'up' on ok", async () => {
    jest.isolateModules(async () => {
      // mock global fetch
      const originalFetch = global.fetch;

      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      const { checkBackendHealth } = require("@/utils/api/api");
      const up = await checkBackendHealth();
      expect(up).toBe("up");

      (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
      const down = await checkBackendHealth();
      expect(down).toBe("down");

      // simulate network throw
      (global.fetch as jest.Mock).mockImplementation(() => {
        throw new Error("no network");
      });
      const down2 = await checkBackendHealth();
      expect(down2).toBe("down");

      global.fetch = originalFetch;
    });
  });
});
