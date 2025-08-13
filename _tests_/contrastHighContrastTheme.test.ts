import { palettes } from '@/constants/colors';
import { contrastRatio } from '@/utils/contrast';

// Smoke test to ensure critical text/background pairs in highContrast palette
// meet or exceed recommended WCAG ratios (>= 4.5:1 for normal text, >=3:1 for UI large/bold).

describe('highContrast palette accessibility', () => {
    const hc = palettes.highContrast;
    it('text vs background >= 7:1 preferred (strict goal)', () => {
        const ratio = contrastRatio(hc.text, hc.background);
        expect(ratio).toBeGreaterThanOrEqual(7);
    });
    it('textSecondary vs background >= 4.5:1', () => {
        const ratio = contrastRatio(hc.textSecondary, hc.background);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
    it('primary vs background >= 4.5:1', () => {
        const ratio = contrastRatio(hc.primary, hc.background);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
    it('border vs background >= 3:1', () => {
        const ratio = contrastRatio(hc.border, hc.background);
        expect(ratio).toBeGreaterThanOrEqual(3);
    });
});
