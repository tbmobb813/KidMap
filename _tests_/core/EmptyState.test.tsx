import { fireEvent, render, screen } from "@testing-library/react-native";
import { MapPin } from "lucide-react-native";
import React from "react";

import { createTestWrapper } from "../testUtils";

import EmptyState from "@/components/EmptyState";

// Mock lucide-react-native
jest.mock("lucide-react-native", () => ({
  MapPin: () => null,
}));

describe("EmptyState - Component Tests", () => {
  const defaultProps = {
    icon: MapPin,
    title: "No results found",
    description: "Try adjusting your search or filters",
  };

  const renderComponent = (props = {}) => {
    const finalProps = { ...defaultProps, ...props };
    return render(<EmptyState {...finalProps} />, {
      wrapper: createTestWrapper(),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderComponent();
    expect(screen.getByText("No results found")).toBeTruthy();
  });

  it("displays title and description correctly", () => {
    renderComponent();

    expect(screen.getByText("No results found")).toBeTruthy();
    expect(
      screen.getByText("Try adjusting your search or filters")
    ).toBeTruthy();
  });

  it("handles action button functionality", () => {
    const mockAction = jest.fn();
    renderComponent({
      actionText: "Try Again",
      onAction: mockAction,
    });

    const actionButton = screen.getByText("Try Again");
    expect(actionButton).toBeTruthy();

    fireEvent.press(actionButton);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it("handles missing action button props correctly", () => {
    const mockAction = jest.fn();

    // Test missing actionText
    renderComponent({ onAction: mockAction });
    expect(screen.queryByText("Try Again")).toBeNull();

    // Test missing onAction
    renderComponent({ actionText: "Try Again" });
    expect(screen.queryByText("Try Again")).toBeNull();
  });

  it("handles theme context properly", () => {
    renderComponent({
      icon: MapPin,
      title: "No places saved",
      description: "Save your favorite places to see them here",
      actionText: "Explore Places",
      onAction: () => {},
    });

    expect(screen.getByText("No places saved")).toBeTruthy();
    expect(
      screen.getByText("Save your favorite places to see them here")
    ).toBeTruthy();
    expect(screen.getByText("Explore Places")).toBeTruthy();
  });
});
