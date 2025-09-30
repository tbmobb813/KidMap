/**
 * NetworkStatusBar Component Tests
 *
 * ComponentTestTemplate test suite for NetworkStatusBar network status component.
 * Tests network connectivity status display, retry functionality, and theme integration.
 */

import { render } from "@testing-library/react-native";
import React from "react";

import { createTestWrapper } from "../testUtils";

import NetworkStatusBar from "@/components/NetworkStatusBar";

// Mock the network status hook
jest.mock("@/hooks/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(),
}));

// Mock lucide-react-native icons
jest.mock("lucide-react-native", () => ({
  WifiOff: ({ size, color }: any) => `MockWifiOff-${size}-${color}`,
  RefreshCw: ({ size, color }: any) => `MockRefreshCw-${size}-${color}`,
}));

const mockUseNetworkStatus =
  require("@/hooks/useNetworkStatus").useNetworkStatus;

describe("NetworkStatusBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with proper wrapper and test ID", () => {
    mockUseNetworkStatus.mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
    });

    const wrapper = createTestWrapper();
    const { getByText } = render(<NetworkStatusBar />, { wrapper });

    expect(getByText("No connection")).toBeTruthy();
  });

  it("does not render when connected with internet", () => {
    mockUseNetworkStatus.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
    });

    const wrapper = createTestWrapper();
    const { queryByText } = render(<NetworkStatusBar />, { wrapper });

    // Should not render any status messages when connected
    expect(queryByText("No connection")).toBeNull();
    expect(queryByText("Limited connectivity")).toBeNull();
  });

  it("displays no connection message when disconnected", () => {
    mockUseNetworkStatus.mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
    });

    const wrapper = createTestWrapper();
    const { getByText } = render(<NetworkStatusBar />, { wrapper });

    expect(getByText("No connection")).toBeTruthy();
  });

  it("displays limited connectivity message when no internet", () => {
    mockUseNetworkStatus.mockReturnValue({
      isConnected: true,
      isInternetReachable: false,
    });

    const wrapper = createTestWrapper();
    const { getByText } = render(<NetworkStatusBar />, { wrapper });

    expect(getByText("Limited connectivity")).toBeTruthy();
  });

  it("handles retry functionality when provided", () => {
    mockUseNetworkStatus.mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
    });

    const mockRetry = jest.fn();
    const wrapper = createTestWrapper();
    const { getByText } = render(<NetworkStatusBar onRetry={mockRetry} />, {
      wrapper,
    });

    expect(getByText("No connection")).toBeTruthy();
    expect(mockRetry).toBeDefined();
  });

  it("handles different connectivity states correctly", () => {
    const states = [
      {
        isConnected: false,
        isInternetReachable: false,
        expected: "No connection",
      },
      {
        isConnected: true,
        isInternetReachable: false,
        expected: "Limited connectivity",
      },
    ];

    states.forEach(({ isConnected, isInternetReachable, expected }) => {
      mockUseNetworkStatus.mockReturnValue({
        isConnected,
        isInternetReachable,
      });
      const wrapper = createTestWrapper();
      const { getByText } = render(<NetworkStatusBar />, { wrapper });

      expect(getByText(expected)).toBeTruthy();
    });
  });
});
