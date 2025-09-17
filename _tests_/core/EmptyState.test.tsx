import { fireEvent } from "@testing-library/react-native";
import { MapPin } from "lucide-react-native";
import React from "react";

import EmptyState from "../../components/EmptyState";
import { render, screen } from "../testUtils";

// Mock lucide-react-native
jest.mock("lucide-react-native", () => ({
  MapPin: () => null,
}));

describe("EmptyState", () => {
  const defaultProps = {
    icon: MapPin,
    title: "No results found",
    description: "Try adjusting your search or filters",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title and description", () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.getByText("No results found")).toBeTruthy();
    expect(
      screen.getByText("Try adjusting your search or filters")
    ).toBeTruthy();
  });

  it("renders action button when provided", () => {
    const mockAction = jest.fn();
    render(
      <EmptyState
        {...defaultProps}
        actionText="Try Again"
        onAction={mockAction}
      />
    );

    const actionButton = screen.getByText("Try Again");
    expect(actionButton).toBeTruthy();

    fireEvent.press(actionButton);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it("does not render action button when actionText is missing", () => {
    const mockAction = jest.fn();
    render(<EmptyState {...defaultProps} onAction={mockAction} />);

    expect(screen.queryByText("Try Again")).toBeNull();
  });

  it("does not render action button when onAction is missing", () => {
    render(<EmptyState {...defaultProps} actionText="Try Again" />);

    expect(screen.queryByText("Try Again")).toBeNull();
  });

  it("renders with different content", () => {
    render(
      <EmptyState
        icon={MapPin}
        title="No places saved"
        description="Save your favorite places to see them here"
        actionText="Explore Places"
        onAction={() => {}}
      />
    );

    expect(screen.getByText("No places saved")).toBeTruthy();
    expect(
      screen.getByText("Save your favorite places to see them here")
    ).toBeTruthy();
    expect(screen.getByText("Explore Places")).toBeTruthy();
  });
});
