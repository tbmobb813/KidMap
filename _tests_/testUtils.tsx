/**
 * Test utilities for KidMap
 * Provides common test helpers, wrappers, and custom render functions
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react-native';
import React from 'react';

import { ThemeProvider } from '@/constants/theme';

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark' | 'highContrast';
  queryClient?: QueryClient;
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function AllTheProviders({ children, theme = 'light', queryClient }: { 
  children: React.ReactNode; 
  theme?: 'light' | 'dark' | 'highContrast';
  queryClient?: QueryClient;
}) {
  const testQueryClient = queryClient || createTestQueryClient();
  
  return (
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider initial={theme}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { theme = 'light', queryClient, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders theme={theme} queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
}

// Re-export everything
export * from '@testing-library/react-native';

// Override render export
export { customRender as render };

// Export additional utilities
export { createTestQueryClient, AllTheProviders };

// Common test data and mocks
export const mockRoute = {
  id: 'test-route-1',
  totalDuration: 25,
  departureTime: '09:00',
  arrivalTime: '09:25',
  steps: [
    { 
      id: 'step-1', 
      type: 'walk' as const, 
      from: 'Home', 
      to: 'Bus Stop', 
      duration: 5 
    },
    { 
      id: 'step-2', 
      type: 'bus' as const, 
      from: 'Bus Stop', 
      to: 'School', 
      duration: 20,
      line: 'Bus Line 42',
      stops: 3
    },
  ],
};

export const mockDirectionStep = {
  id: 'step-1',
  type: 'walk' as const,
  from: 'Home',
  to: 'Bus Stop',
  duration: 5,
};

// Mock current location for tests
export const mockLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 10,
  timestamp: Date.now(),
};
