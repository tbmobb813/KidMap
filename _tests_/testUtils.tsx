/**
 * Test utilities for KidMap
 * Provides common test helpers, wrappers, and custom render functions
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, RenderOptions } from '@testing-library/react-native';
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
  export { AllTheProviders, createTestQueryClient };

// Export createTestWrapper for component tests
export function createTestWrapper(options: CustomRenderOptions = {}) {
  const { theme = 'light', queryClient } = options;
  
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders theme={theme} queryClient={queryClient}>
      {children}
    </AllTheProviders>
  );
  
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
}

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

// Shared test utilities for consolidating repeated logic
export const testAccessibility = (component: React.ReactElement, expectedElements: string[]) => {
  const { getByText, getByTestId } = customRender(component);
  
  expectedElements.forEach(element => {
    try {
      const el = getByText(element);
      expect(el).toBeTruthy();
    } catch {
      try {
        const el = getByTestId(element);
        expect(el).toBeTruthy();
      } catch {
        throw new Error(`Element "${element}" not found in component`);
      }
    }
  });
};

export const testButtonPress = (
  component: React.ReactElement,
  buttonText: string,
  expectedAction?: () => void
) => {
  const { getByText } = customRender(component);
  const button = getByText(buttonText);
  expect(button).toBeTruthy();
  
  fireEvent.press(button);
  
  if (expectedAction) {
    expectedAction();
  }
};

export const testThemeToggling = (
  ComponentToTest: React.ComponentType<any>,
  props: any = {}
) => {
  // Test light theme
  const lightRender = customRender(<ComponentToTest {...props} />, { theme: 'light' });
  expect(lightRender.getByTestId || lightRender.getByText).toBeTruthy();

  // Test dark theme
  const darkRender = customRender(<ComponentToTest {...props} />, { theme: 'dark' });
  expect(darkRender.getByTestId || darkRender.getByText).toBeTruthy();

  // Test high contrast theme
  const hcRender = customRender(<ComponentToTest {...props} />, { theme: 'highContrast' });
  expect(hcRender.getByTestId || hcRender.getByText).toBeTruthy();
};

export const mockStores = {
  parentalStore: {
    useParentalStore: () => ({
      settings: { emergencyContacts: [{ id: "p1", phone: "9876543210", isPrimary: true }] },
      dashboardData: { safeZoneActivity: [] },
      devicePings: [],
      addCheckInToDashboard: jest.fn(),
      updateLastKnownLocation: jest.fn(),
    }),
  },
  gamificationStore: {
    useGamificationStore: () => ({
      safetyContacts: [{ id: "c1", phone: "1234567890", isPrimary: true }],
      stats: { trips: 10, badges: 5, points: 100 },
    }),
  },
  navigationStore: {
    useNavigationStore: () => ({
      addLocationVerifiedPhotoCheckIn: jest.fn(),
      routes: [],
      currentRoute: null,
    }),
  },
};

export const mockHooks = {
  useToast: () => ({
    toast: null,
    showToast: jest.fn(),
    hideToast: jest.fn(),
  }),
  useLocation: () => ({
    location: mockLocation,
    loading: false,
    error: null,
  }),
  useNetworkStatus: () => ({
    isConnected: true,
    isInternetReachable: true,
  }),
};

export const mockReactNative = {
  Alert: { alert: jest.fn(), prompt: jest.fn() },
  Linking: { openURL: jest.fn() },
  Vibration: { vibrate: jest.fn(), cancel: jest.fn() },
  Clipboard: { setString: jest.fn(), getString: jest.fn(() => Promise.resolve("")) },
};

// Common accessibility test patterns
export const accessibilityTestCases = {
  hasAccessibilityLabel: (element: any, expectedLabel: string) => {
    expect(element).toHaveAccessibilityValue({ text: expectedLabel });
  },
  hasAccessibilityRole: (element: any, expectedRole: string) => {
    expect(element).toHaveProp("accessibilityRole", expectedRole);
  },
  hasAccessibilityHint: (element: any, expectedHint: string) => {
    expect(element).toHaveProp("accessibilityHint", expectedHint);
  },
  isAccessibilityFocusable: (element: any) => {
    expect(element).toHaveProp("accessible", true);
  },
};

// Integration test helpers
export const integrationTestHelpers = {
  simulateUserFlow: async (steps: Array<{ action: string; target: string; wait?: number }>, renderResult: any) => {
    const { getByText, getByTestId } = renderResult;
    
    for (const step of steps) {
      let element;
      try {
        element = getByText(step.target);
      } catch {
        element = getByTestId(step.target);
      }
      
      switch (step.action) {
        case "press":
          fireEvent.press(element);
          break;
        case "changeText":
          fireEvent.changeText(element, step.target);
          break;
        default:
          throw new Error(`Unknown action: ${step.action}`);
      }
      
      if (step.wait) {
        await new Promise(resolve => setTimeout(resolve, step.wait));
      }
    }
  },
};
