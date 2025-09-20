import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render as rtlRender,
  RenderOptions,
  RenderAPI,
} from "@testing-library/react-native";
import React from "react";

import { ThemeProvider } from "../constants/theme";
import { ToastProvider } from "../providers/ToastProvider";

// Ensure manual mock for lucide icons is used across tests
try {
  // jest may not be defined in some runtimes; guard it
  if (typeof jest !== "undefined" && typeof jest.mock === "function") {
    jest.mock("lucide-react-native");
  }
} catch {}

type CustomRenderOptions = Omit<RenderOptions, "wrapper"> & {
  theme?: "light" | "dark" | "highContrast";
  queryClient?: QueryClient;
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
}

export function AllTheProviders({
  children,
  theme = "light",
  queryClient,
}: {
  children: React.ReactNode;
  theme?: "light" | "dark" | "highContrast";
  queryClient?: QueryClient;
}) {
  const qc = queryClient || createTestQueryClient();
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider initial={theme}>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { theme = "light", queryClient, ...renderOptions } = options;
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders theme={theme} queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
}

// Re-export testing-library helpers but override render
export * from "@testing-library/react-native";
export { customRender as render };

export function createTestWrapper(options: CustomRenderOptions = {}) {
  const { theme = "light", queryClient } = options;
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <AllTheProviders theme={theme} queryClient={queryClient}>
        {children}
      </AllTheProviders>
    );
  };
}

export function testThemeToggling(
  ComponentToTest: React.ComponentType<any>,
  props: any = {}
) {
  // smoke render in multiple themes
  const light = customRender(<ComponentToTest {...props} />, {
    theme: "light",
  });
  expect(light).toBeTruthy();
  const dark = customRender(<ComponentToTest {...props} />, { theme: "dark" });
  expect(dark).toBeTruthy();
}

export function mockRoute(overrides: Record<string, any> = {}) {
  return Object.assign(
    {
      id: "mock-route-1",
      name: "Mock Route",
      steps: [],
      // match the `Route` type expected by tests
      totalDuration: 25,
      departureTime: "09:00",
      arrivalTime: "09:25",
      duration: 0,
      distance: 0,
    },
    overrides
  );
}

export const mockLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 10,
  timestamp: Date.now(),
};

export const mockStores = {
  // Mock store data for tests - actual mocking is done in jest.setup.js
};

export const mockHooks = {
  useToast: () => ({ toast: null, showToast: jest.fn(), hideToast: jest.fn() }),
  useLocation: () => ({ location: mockLocation, loading: false, error: null }),
};

export const mockReactNative = {
  Alert: { alert: jest.fn(), prompt: jest.fn() },
  Linking: { openURL: jest.fn() },
  Vibration: { vibrate: jest.fn(), cancel: jest.fn() },
};

export const integrationTestHelpers = {
  simulateUserFlow: async (
    steps: Array<{ action: string; target: string; wait?: number }>,
    renderResult: RenderAPI
  ) => {
    const { getByText, getByTestId } = renderResult;
    for (const step of steps) {
      let element: any;
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
      if (step.wait) await new Promise((r) => setTimeout(r, step.wait));
    }
  },
};
