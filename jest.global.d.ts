// TypeScript global types for Jest
import '@testing-library/jest-native/extend-expect';
declare namespace jest {
  interface Matchers<R> {
    toHaveBeenCalledWith(...args: any[]): R;
    toHaveBeenCalledTimes(times: number): R;
    toHaveBeenCalled(): R;
    toHaveBeenLastCalledWith(...args: any[]): R;
  }
}
