describe('SafeAsyncStorage fallback behavior', () => {
  it('returns fallback when AsyncStorage.getItem fails and recovery=fallback', async () => {
    jest.isolateModules(async () => {
      // Mock AsyncStorage to always throw
      jest.doMock('@react-native-async-storage/async-storage', () => ({
        getItem: jest.fn(async () => { throw new Error('fail'); }),
        setItem: jest.fn(async () => {}),
        removeItem: jest.fn(async () => {}),
      }));

      const mod = require('@/utils/error/errorHandling');

      const val = await mod.SafeAsyncStorage.getItem('key', { a: 1 }, { strategy: 'fallback', fallbackValue: { a: 1 } });
      expect(val).toEqual({ a: 1 });
    });
  });
});
