import { renderHook } from '@testing-library/react';
// Update the import path if the hook is located elsewhere, for example:
import { useCustomHook } from '../hooks/useCustomHook';
// Or create the file '../src/hooks/useCustomHook.ts' and export useCustomHook from it.

test('hello world!', () => {
  const { result } = renderHook(() => useCustomHook());
  expect(result.current.value).toBe('hello world');
});