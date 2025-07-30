import { renderHook } from '@testing-library/react';
import { useCustomHook } from '@/hooks/useCustomHook';

test('hello world!', () => {
  const { result } = renderHook(() => useCustomHook());
  expect(result.current.value).toBe('hello world');
});