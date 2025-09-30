import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';


import { ThemeProvider } from '@/constants/theme';
import { ToastProvider } from '@/providers/ToastProvider';

describe('Provider smoke test (minimal)', () => {
  it('renders a Text child when all providers are composed', () => {
    const qc = new QueryClient();
    const { getByText } = render(
      <QueryClientProvider client={qc}>
        <ThemeProvider>
          <ToastProvider>
            <Text>{'ok'}</Text>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    expect(getByText('ok')).toBeTruthy();
  });
});
