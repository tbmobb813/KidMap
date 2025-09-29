import { analytics, trackScreenView, trackUserAction, trackError } from '@/utils/analytics/analytics';

describe('analytics', () => {
  beforeEach(() => {
    analytics.clearEvents();
    analytics.setEnabled(true);
  });

  it('tracks events when enabled', () => {
    trackScreenView('Home');
    trackUserAction('click', { id: 1 });
    const events = analytics.getEvents();
    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events.some(e => e.name === 'screen_view')).toBeTruthy();
  });

  it('does not track when disabled', () => {
    analytics.setEnabled(false);
    trackUserAction('tap');
    expect(analytics.getEvents().length).toBe(0);
  });

  it('trackError records error details', () => {
    const err = new Error('boom');
    trackError(err, 'ctx');
  const ev = analytics.getEvents().find((e: any) => e.name === 'error');
  expect(ev).toBeDefined();
  if (!ev) throw new Error('expected error event');
  expect(ev.properties).toBeDefined();
  expect((ev.properties as any).error_message).toBe('boom');
  });
});
