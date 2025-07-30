// Simple debug test to check if Jest is working
describe('Debug Tests', () => {
  it('should run basic arithmetic test', () => {
    expect(2 + 2).toBe(4);
  });

  it('should test string operations', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });

  it('should test array operations', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });
});
