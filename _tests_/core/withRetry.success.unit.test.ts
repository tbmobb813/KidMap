import { withRetry } from '@/utils/error/errorHandling';

describe('withRetry utility', () => {
  it('retries a flaky operation and eventually succeeds', async () => {
    let attempts = 0;
    const op = jest.fn(async () => {
      attempts += 1;
      if (attempts < 2) throw new Error('temporary');
      return 'ok';
    });

    const result = await withRetry(op, { maxAttempts: 3, delayMs: 0, backoffMultiplier: 1 });
    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledTimes(2);
  });
});
