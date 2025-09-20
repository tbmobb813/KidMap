/**
 * LoadingSpinner component test following Component Template pattern
 * Foundation component - loading state indicator
 */

import { render } from "@testing-library/react-native";
import React from "react";

import LoadingSpinner from "../../components/LoadingSpinner";
import { createTestWrapper } from "../testUtils";

// ===== COMPONENT TEST SETUP =====
describe("LoadingSpinner - Component Tests", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  // ===== ESSENTIAL TESTS ONLY =====

  it("renders without crashing", () => {
    const wrapper = createTestWrapper();

    render(<LoadingSpinner />, { wrapper });
  });

  it("displays loading indicator", () => {
    const wrapper = createTestWrapper();

    const { getByTestId } = render(<LoadingSpinner />, { wrapper });

    expect(getByTestId("loading-spinner")).toBeTruthy();
  });

  it("handles theme context properly", () => {
    const wrapper = createTestWrapper();

    const { getByTestId } = render(<LoadingSpinner />, { wrapper });

    // Should render without theme errors
    expect(getByTestId("loading-spinner")).toBeTruthy();
  });
});
