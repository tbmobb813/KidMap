import authUtils from '@/utils/auth';
import { SafeAsyncStorage } from '@/utils/error/errorHandling';

describe('auth biometric storage helpers', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns true when storage contains boolean true', async () => {
    jest.spyOn(SafeAsyncStorage, 'getItem' as any).mockResolvedValue(true);
    const res = await authUtils.isBiometricAuthEnabled();
    expect(res).toBe(true);
  });

  it('handles string "true" and boolean false', async () => {
    jest.spyOn(SafeAsyncStorage, 'getItem' as any).mockResolvedValue('true');
    expect(await authUtils.isBiometricAuthEnabled()).toBe(true);

    jest.spyOn(SafeAsyncStorage, 'getItem' as any).mockResolvedValue(false);
    expect(await authUtils.isBiometricAuthEnabled()).toBe(false);
  });

  it('returns false on storage error', async () => {
    jest.spyOn(SafeAsyncStorage, 'getItem' as any).mockRejectedValue(new Error('fail'));
    const res = await authUtils.isBiometricAuthEnabled();
    expect(res).toBe(false);
  });
});
