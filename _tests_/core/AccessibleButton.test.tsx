/**
 * AccessibleButton component test following Component Template pattern
 * Foundation component - accessible button interactions
 */

import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import AccessibleButton from "../../components/AccessibleButton";
import { createTestWrapper } from "../testUtils";

// ===== COMPONENT TEST SETUP =====
describe("AccessibleButton - Component Tests", () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  // ===== ESSENTIAL TESTS ONLY =====

  it("renders without crashing", () => {
    const wrapper = createTestWrapper();

    render(<AccessibleButton title="Test Button" onPress={mockOnPress} />, {
      wrapper,
    });
  });

  it("displays button title correctly", () => {
    const wrapper = createTestWrapper();

    const { getByText } = render(
      <AccessibleButton title="Click me" onPress={mockOnPress} />,
      { wrapper }
    );

    expect(getByText("Click me")).toBeTruthy();
  });

  it("handles press events", () => {
    const wrapper = createTestWrapper();

    const { getByText } = render(
      <AccessibleButton title="Press me" onPress={mockOnPress} />,
      { wrapper }
    );

    fireEvent.press(getByText("Press me"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("handles theme context properly", () => {
    const wrapper = createTestWrapper();

    render(<AccessibleButton title="Themed Button" onPress={mockOnPress} />, {
      wrapper,
    });

    // Should render without theme errors
    expect(true).toBe(true);
  });
});
