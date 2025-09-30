import { isValidEmail, isValidPassword } from '@/utils/auth';

describe('auth validators', () => {
  describe('isValidEmail', () => {
    it('accepts valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@sub.domain.co')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(isValidEmail('no-at-symbol')).toBe(false);
      expect(isValidEmail('missingdomain@')).toBe(false);
      expect(isValidEmail('@no-local')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('rejects too short passwords and missing classes', () => {
      const r1 = isValidPassword('aB3!');
      expect(r1.isValid).toBe(false);
      expect(r1.errors.length).toBeGreaterThan(0);

      const r2 = isValidPassword('abcdefgh'); // missing upper, digit, special
      expect(r2.isValid).toBe(false);
      expect(r2.errors).toEqual(expect.arrayContaining([
        expect.stringContaining('uppercase'),
        expect.stringContaining('numbers'),
        expect.stringContaining('special'),
      ]));
    });

    it('accepts a medium strength password', () => {
      const res = isValidPassword('Abcdef1!'); // meets basics but not long+special
      expect(res.isValid).toBe(true);
      expect(res.strength).toBe('medium');
    });

    it('accepts a strong password', () => {
      const res = isValidPassword('Abcdefghijk1!'); // long + special
      expect(res.isValid).toBe(true);
      expect(res.strength).toBe('strong');
    });
  });
});
