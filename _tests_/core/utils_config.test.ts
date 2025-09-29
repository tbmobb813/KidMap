import Config from '@/utils/config/config';

describe('utils config', () => {
  it('reads APP_NAME and platform flags', () => {
    expect(Config.APP_NAME).toBeDefined();
    expect(typeof Config.PLATFORM.IS_WEB).toBe('boolean');
  });
});
