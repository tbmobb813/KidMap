/**
 * Tests for unified announce API (S3-4).
 */
import { announce, announceForAccessibility } from '../utils/accessibility';

// Mock react-native minimally to force Platform.OS = 'web' so live region path executes.
jest.mock('react-native', () => ({
    Platform: { OS: 'web', select: (sel: any) => sel.web },
    AccessibilityInfo: { announceForAccessibility: jest.fn() },
}));

describe('announce API (web live regions)', () => {
    beforeEach(() => {
        // Clear any prior regions
        document.getElementById('__a11y_live_polite')?.remove();
        document.getElementById('__a11y_live_assertive')?.remove();
        jest.useFakeTimers();
        jest.spyOn(console, 'warn').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        (console.warn as jest.Mock).mockRestore?.();
    });

    it('creates polite live region and injects message', () => {
        announce('Hello world');
        const region = document.getElementById('__a11y_live_polite');
        expect(region).toBeTruthy();
        expect(region!.textContent).toBe('');
        jest.advanceTimersByTime(15);
        expect(region!.textContent).toBe('Hello world');
    });

    it('dedupes rapid identical messages within window', () => {
        announce('Repeat');
        jest.advanceTimersByTime(15);
        const region = document.getElementById('__a11y_live_polite')!;
        expect(region.textContent).toBe('Repeat');
        announce('Repeat');
        jest.advanceTimersByTime(30);
        expect(region.textContent).toBe('Repeat');
    });

    it('creates assertive region when politeness=assertive', () => {
        announce('Important', { politeness: 'assertive' });
        const region = document.getElementById('__a11y_live_assertive');
        expect(region).toBeTruthy();
        jest.advanceTimersByTime(15);
        expect(region!.textContent).toBe('Important');
    });

    it('deprecated announceForAccessibility delegates & warns (assertive)', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        (global as any).__DEV__ = true;
        announceForAccessibility('Legacy');
        jest.advanceTimersByTime(15);
        const polite = document.getElementById('__a11y_live_polite');
        const assertive = document.getElementById('__a11y_live_assertive');
        expect(polite || assertive).toBeTruthy();
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });
});
