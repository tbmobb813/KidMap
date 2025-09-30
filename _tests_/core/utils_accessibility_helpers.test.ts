import { getAccessibilityLabel, getAccessibilityHint } from '@/utils/accessibility/accessibility';

describe('accessibility helpers', () => {
  it('getAccessibilityLabel composes context when provided', () => {
    expect(getAccessibilityLabel('Play', 'Audio')).toBe('Play, Audio');
  });

  it('getAccessibilityHint returns expected string', () => {
    expect(getAccessibilityHint('open menu')).toMatch(/Double tap to open menu/);
  });
});
