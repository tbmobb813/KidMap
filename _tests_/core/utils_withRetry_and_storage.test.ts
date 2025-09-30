import { withRetry } from '@/utils/error/errorHandling';

jest.useRealTimers();

describe('withRetry and SafeAsyncStorage', () => {
  it('withRetry succeeds after transient failures', async () => {
    let attempts = 0;
    const op = jest.fn(async () => {
      attempts++;
      if (attempts < 2) throw new Error('temporary');
      return 'ok';
    });

    const res = await withRetry(op, { maxAttempts: 3, delayMs: 0, backoffMultiplier: 1 });
    expect(res).toBe('ok');
    expect(attempts).toBeGreaterThanOrEqual(2);
  });

  it('SafeAsyncStorage returns fallback on failure when strategy is fallback', async () => {
    // Ensure module registry is clean so our mock is used by the module under test
    jest.resetModules();

    let SafeAsyncStorage: any;

    // isolate module loading so the jest.mock applies for the require call
    jest.isolateModules(() => {
      jest.mock('@react-native-async-storage/async-storage', () => ({
        getItem: jest.fn(async () => { throw new Error('fail'); }),
        setItem: jest.fn(async () => { throw new Error('fail'); }),
        removeItem: jest.fn(async () => { throw new Error('fail'); }),
      }));

      // require the module after mocking AsyncStorage so it picks up the mock
       
      SafeAsyncStorage = require('@/utils/error/errorHandling').SafeAsyncStorage;
    });

    const val = await SafeAsyncStorage.getItem('key', { foo: 'bar' }, { strategy: 'fallback', fallbackValue: { foo: 'bar' } });
    expect(val).toEqual({ foo: 'bar' });
  });
});
