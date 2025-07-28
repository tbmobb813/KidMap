import { useState } from 'react';

export function useCustomHook() {
  const [value, setValue] = useState('hello world');
  return { value, setValue };
}