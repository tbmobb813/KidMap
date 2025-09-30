import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { ThemeProvider } from '@/constants/theme';
import { ToastProvider } from '@/providers/ToastProvider';

describe('Provider smoke test', () => {
  it('exports are callable components', () => {
    expect(typeof ThemeProvider).toBe('function');
    expect(typeof ToastProvider).toBe('function');
    expect(typeof QueryClientProvider).toBe('function');
  });

  it('AllTheProviders can render a simple child', () => {
    const QC = require('@tanstack/react-query').QueryClient;
    const renderResult = render(
      <QueryClientProvider client={new QC()}>
        <ThemeProvider>
          <ToastProvider>
            <Text>{'ok'}</Text>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  // ensure renderResult.debug exists if needed in future
  void renderResult.debug;
    const { getByText } = renderResult;
    expect(getByText('ok')).toBeTruthy();
  });
});
