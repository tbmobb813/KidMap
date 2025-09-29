import { render, act } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the immediate value and then the debounced value after delay', async () => {
    const DebounceHarness = ({ value, delay }: { value: string; delay: number }) => {
      // require inside the component so the hook is executed with the same
      // React instance that the renderer provides (avoids hooks dispatcher null)
      const useDebounce = require('@/hooks/useDebounce').useDebounce;
      const v = useDebounce(value, delay);
      return <Text testID="val">{v}</Text>;
    };

    const { getByTestId, rerender } = render(<DebounceHarness value="a" delay={500} />);

    // immediate render shows initial value
    expect(getByTestId('val').props.children).toBe('a');

    // update value prop
    rerender(<DebounceHarness value="b" delay={500} />);

    // still old value before timers run
    expect(getByTestId('val').props.children).toBe('a');

    // advance timers to settle debounce
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(getByTestId('val').props.children).toBe('b');
  });
});
