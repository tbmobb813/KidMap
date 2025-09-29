import { isValidEmail, isValidPassword } from '../../utils/auth';

describe('auth validators - additional', () => {
  test('isValidEmail accepts valid emails and rejects invalid', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('user@sub.domain.co')).toBe(true);
  });

  test('isValidPassword identifies weak and strong passwords and returns errors', () => {
    const weak = isValidPassword('abc');
    expect(weak.isValid).toBe(false);
    expect(weak.errors.length).toBeGreaterThan(0);

    const strong = isValidPassword('Abcdefgh1!@#');
    expect(strong.isValid).toBe(true);
    expect(strong.strength).toBe('strong');
  });
});
