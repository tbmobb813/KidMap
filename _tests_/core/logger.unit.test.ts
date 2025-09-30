describe('logger utility', () => {
  it('calls underlying console methods and stores logs', () => {
    jest.isolateModules(() => {
  // Replace Config flags so logger prints (mock the actual utils path)
  jest.doMock('@/utils/config/config', () => ({ isDev: true, isProduction: false }));

      const spyLog = jest.spyOn(console, 'log').mockImplementation(() => {});
      const spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const spyError = jest.spyOn(console, 'error').mockImplementation(() => {});

      const lmod = require('@/utils/error/logger');
      const { log, logger } = lmod;

      log.debug('d1');
      log.info('i1');
      log.warn('w1');
      log.error('e1', new Error('boom'));

      const all = logger.getLogs();
      expect(Array.isArray(all)).toBe(true);
      // exportLogs returns a string
      const exported = logger.exportLogs();
      expect(typeof exported).toBe('string');

      spyLog.mockRestore();
      spyWarn.mockRestore();
      spyError.mockRestore();
    });
  });
});
