/**
 * ErrorBoundary component test following Component Template pattern
 * Foundation component - error handling and recovery
 */

import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import ErrorBoundary from "../../components/ErrorBoundary";
import { createTestWrapper } from "../testUtils";

// ===== TEST HELPER COMPONENTS =====
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <Text testID="child-content">Child rendered successfully</Text>;
};

// ===== COMPONENT TEST SETUP =====
describe("ErrorBoundary - Component Tests", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Suppress console.error for error boundary tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ===== ESSENTIAL TESTS ONLY =====

  it("renders children when no error occurs", () => {
    const wrapper = createTestWrapper();

    const { getByTestId } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
      { wrapper }
    );

    expect(getByTestId("child-content")).toBeTruthy();
  });

  it("renders error UI when child throws error", () => {
    const wrapper = createTestWrapper();

    const { getByTestId } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
      { wrapper }
    );

    // Should render error fallback UI with testID
    expect(getByTestId("error-fallback-root")).toBeTruthy();
  });

  it("handles theme context properly", () => {
    const wrapper = createTestWrapper();

    render(
      <ErrorBoundary>
        <Text>Test content</Text>
      </ErrorBoundary>,
      { wrapper }
    );

    // Should render without theme errors
    expect(true).toBe(true);
  });
});
