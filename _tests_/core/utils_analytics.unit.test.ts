import { analytics, trackScreenView, trackUserAction, trackError } from '@/utils/analytics/analytics';

describe('analytics utility', () => {
  beforeEach(() => {
    analytics.clearEvents();
    analytics.setEnabled(true);
  });

  test('tracks screen view and user action and exposes events', () => {
    trackScreenView('Home');
    trackUserAction('tap_button', { id: 'btn1' });

    const events = analytics.getEvents();
    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events[0].name).toBe('screen_view');
    expect(events[1].name).toBe('user_action');
    expect(events[1].properties).toMatchObject({ action: 'tap_button', id: 'btn1' });
  });

  test('tracks error and respects disabled flag', () => {
    const err = new Error('uh-oh');
    trackError(err, 'during-test');
    expect(analytics.getEvents().some(e => e.name === 'error')).toBe(true);

    analytics.setEnabled(false);
    analytics.clearEvents();
    trackUserAction('no_op');
    expect(analytics.getEvents().length).toBe(0);
  });
});
