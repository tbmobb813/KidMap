// basic.test.js

describe('Basic Sanity Test', () => {
  it('should perform a simple addition correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should validate truthy/falsy values', () => {
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
  });
});
