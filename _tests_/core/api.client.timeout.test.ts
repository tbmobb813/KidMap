describe("ApiClient request timeout handling", () => {
  beforeEach(() => jest.resetModules());

  it("throws 'Request timeout' when fetch never resolves within timeout", async () => {
    jest.isolateModules(async () => {
      // mock AsyncStorage used by ApiClient
      jest.doMock("@react-native-async-storage/async-storage", () => ({
        getItem: async () => null,
        setItem: async () => {},
        removeItem: async () => {},
      }));

      // mock fetch that never resolves
      global.fetch = jest.fn().mockImplementation(() =>
        new Promise(() => {
          /* never resolves */
        })
      );

      const { apiClient } = require("@/utils/api/api");

      // Shorten internal timeout for test
      apiClient.timeout = 10;

      await expect(apiClient.get("/test")).rejects.toThrow(/Request timeout/);
    });
  });
});
