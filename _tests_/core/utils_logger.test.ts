import { log, logger } from '@/utils/error/logger';

describe('logger basics', () => {
  it('records logs and can export them', () => {
    logger.clearLogs();
    log.info('test-info', { a: 1 });
    log.debug('test-debug');
    const out = logger.exportLogs();
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  });
});
