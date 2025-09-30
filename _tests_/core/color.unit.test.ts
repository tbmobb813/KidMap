import { withAlpha, tint } from '../../utils/color/color';

describe('color utils', () => {
  it('withAlpha appends alpha for valid hex', () => {
    expect(withAlpha('#112233', 'AA')).toBe('#112233AA');
  });

  it('withAlpha returns input unchanged for malformed', () => {
    expect(withAlpha('blue' as any, 'AA')).toBe('blue');
    expect(withAlpha('', 'AA')).toBe('');
  });

  it('tint uses 22 alpha', () => {
    expect(tint('#abcdef')).toBe('#abcdef22');
  });
});
