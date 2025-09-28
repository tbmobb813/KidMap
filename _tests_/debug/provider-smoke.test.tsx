import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import React from 'react';

import { ThemeProvider } from '@/constants/theme';
import { ToastProvider } from '@/providers/ToastProvider';

describe('Provider smoke test', () => {
  it('exports are callable components', () => {
    expect(typeof ThemeProvider).toBe('function');
    expect(typeof ToastProvider).toBe('function');
    expect(typeof QueryClientProvider).toBe('function');
  });

  it('AllTheProviders can render a simple child', () => {
    const { getByText } = render(
      <QueryClientProvider client={new (require('@tanstack/react-query').QueryClient)()}>
        <ThemeProvider>
          <ToastProvider>
            <>{'ok'}</>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    expect(getByText('ok')).toBeTruthy();
  });
});
