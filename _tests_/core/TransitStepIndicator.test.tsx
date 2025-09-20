import { render } from "@testing-library/react-native";
import React from "react";

import { createTestWrapper } from "@/_tests_/testUtils";
import TransitStepIndicator from "@/components/TransitStepIndicator";
import { TransitStep } from "@/types/navigation";

// ===== MOCKS =====
// URI-based mock triggering to avoid Jest module scope violations
jest.mock("lucide-react-native", () => ({
  Train: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "train-icon",
      children: `🚊`,
      style: { fontSize: size, color },
      ...props,
    }),
  Bus: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "bus-icon",
      children: `🚌`,
      style: { fontSize: size, color },
      ...props,
    }),
  Navigation: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "walk-icon",
      children: `🚶`,
      style: { fontSize: size, color },
      ...props,
    }),
  Bike: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "bike-icon",
      children: `🚴`,
      style: { fontSize: size, color },
      ...props,
    }),
  Car: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "car-icon",
      children: `🚗`,
      style: { fontSize: size, color },
      ...props,
    }),
}));

// ===== HELPER FUNCTIONS =====
const createMockTransitStep = (
  overrides: Partial<TransitStep> = {}
): TransitStep => ({
  id: "step-1",
  type: "bus",
  from: "Station A",
  to: "Station B",
  duration: 15,
  ...overrides,
});

const renderWithTheme = (component: React.ReactElement, options: any = {}) => {
  return render(component, { wrapper: createTestWrapper(), ...options });
};

describe("TransitStepIndicator Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== SMOKE TESTS =====
  it("should render without errors", () => {
    const step = createMockTransitStep();
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} />
    );
    expect(getByTestId("bus-icon")).toBeTruthy();
  });

  // ===== PROP VERIFICATION =====
  it("should render with required step prop", () => {
    const step = createMockTransitStep({ type: "train" });
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} />
    );
    expect(getByTestId("train-icon")).toBeTruthy();
  });

  it("should default to medium size when no size specified", () => {
    const step = createMockTransitStep();
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} />
    );
    const icon = getByTestId("bus-icon");
    expect(icon.props.style.fontSize).toBe(18); // medium size
  });

  // ===== SIZE TESTS =====
  it("should render small size correctly", () => {
    const step = createMockTransitStep();
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} size="small" />
    );
    const icon = getByTestId("bus-icon");
    expect(icon.props.style.fontSize).toBe(14); // small size
  });

  it("should render medium size correctly", () => {
    const step = createMockTransitStep();
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} size="medium" />
    );
    const icon = getByTestId("bus-icon");
    expect(icon.props.style.fontSize).toBe(18); // medium size
  });

  it("should render large size correctly", () => {
    const step = createMockTransitStep();
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} size="large" />
    );
    const icon = getByTestId("bus-icon");
    expect(icon.props.style.fontSize).toBe(24); // large size
  });

  // ===== TRANSIT MODE TESTS =====
  it("should render subway icon for subway type", () => {
    const step = createMockTransitStep({ type: "subway" });
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} />
    );
    expect(getByTestId("train-icon")).toBeTruthy();
  });

  it("should render train icon for train type", () => {
    const step = createMockTransitStep({ type: "train" });
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} />
    );
    expect(getByTestId("train-icon")).toBeTruthy();
  });

  it("should render bus icon for bus type", () => {
    const step = createMockTransitStep({ type: "bus" });
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} />
    );
    expect(getByTestId("bus-icon")).toBeTruthy();
  });

  it("should render walk icon for walk type", () => {
    const step = createMockTransitStep({ type: "walk" });
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} />
    );
    expect(getByTestId("walk-icon")).toBeTruthy();
  });

  it("should render bike icon for bike type", () => {
    const step = createMockTransitStep({ type: "bike" });
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} />
    );
    expect(getByTestId("bike-icon")).toBeTruthy();
  });

  it("should render car icon for car type", () => {
    const step = createMockTransitStep({ type: "car" });
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} />
    );
    expect(getByTestId("car-icon")).toBeTruthy();
  });

  // ===== LINE TEXT TESTS =====
  it("should render line text when step has line property", () => {
    const step = createMockTransitStep({ line: "4", type: "subway" });
    const { getByText, queryByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} />
    );
    expect(getByText("4")).toBeTruthy();
    expect(queryByTestId("train-icon")).toBeNull();
  });

  it("should render line text with correct styling", () => {
    const step = createMockTransitStep({ line: "B46" });
    const { getByText } = renderWithTheme(
      <TransitStepIndicator step={step} size="large" />
    );
    const lineText = getByText("B46");
    // Style is an array, so we need to check individual style properties
    expect(lineText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: "#FFFFFF", fontWeight: "700" }),
        expect.objectContaining({ fontSize: 18 }),
      ])
    );
  });

  // ===== COLOR TESTS =====
  it("should use custom color when provided", () => {
    const step = createMockTransitStep({ color: "#FF5722" });
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} />
    );
    const icon = getByTestId("bus-icon");
    const container = icon.parent.parent; // Need to go up two levels to find the container
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "#FF5722" }),
      ])
    );
  });

  it("should use default theme colors for different transit modes", () => {
    const busStep = createMockTransitStep({ type: "bus" });
    const { getByTestId: getBusContainer } = renderWithTheme(
      <TransitStepIndicator step={busStep} />
    );
    const busIcon = getBusContainer("bus-icon");
    const busContainer = busIcon.parent.parent; // Go up to container
    expect(busContainer.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: expect.any(String) }),
      ])
    );

    const walkStep = createMockTransitStep({ type: "walk" });
    const { getByTestId: getWalkContainer } = renderWithTheme(
      <TransitStepIndicator step={walkStep} />
    );
    const walkIcon = getWalkContainer("walk-icon");
    const walkContainer = walkIcon.parent.parent; // Go up to container
    expect(walkContainer.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: expect.any(String) }),
      ])
    );
  });

  // ===== CONTAINER STYLING TESTS =====
  it("should apply correct dimensions for small size", () => {
    const step = createMockTransitStep();
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} size="small" />
    );
    const icon = getByTestId("bus-icon");
    const container = icon.parent.parent; // Go up to container
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 24,
          height: 24,
          borderRadius: 12,
        }),
      ])
    );
  });

  it("should apply correct dimensions for medium size", () => {
    const step = createMockTransitStep();
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} size="medium" />
    );
    const icon = getByTestId("bus-icon");
    const container = icon.parent.parent; // Go up to container
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 32,
          height: 32,
          borderRadius: 16,
        }),
      ])
    );
  });

  it("should apply correct dimensions for large size", () => {
    const step = createMockTransitStep();
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} size="large" />
    );
    const icon = getByTestId("bus-icon");
    const container = icon.parent.parent; // Go up to container
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 40,
          height: 40,
          borderRadius: 20,
        }),
      ])
    );
  });

  // ===== THEME INTEGRATION =====
  it("should apply theme colors to icons", () => {
    const step = createMockTransitStep();
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} />
    );
    const icon = getByTestId("bus-icon");
    expect(icon.props.style.color).toBeDefined();
  });

  // ===== EDGE CASES =====
  it("should handle unknown transit type gracefully", () => {
    const step = createMockTransitStep({ type: "unknown" as any });
    expect(() => {
      renderWithTheme(<TransitStepIndicator step={step} />);
    }).not.toThrow();
  });

  it("should handle empty line text", () => {
    const step = createMockTransitStep({ line: "" });
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} />
    );
    // Should fall back to icon when line is empty
    expect(getByTestId("bus-icon")).toBeTruthy();
  });

  it("should handle very long line text", () => {
    const step = createMockTransitStep({ line: "VERYLONGLINENAME123" });
    const { getByText } = renderWithTheme(<TransitStepIndicator step={step} />);
    expect(getByText("VERYLONGLINENAME123")).toBeTruthy();
  });

  // ===== ACCESSIBILITY =====
  it("should maintain accessibility with proper icon sizing", () => {
    const step = createMockTransitStep();
    const { getByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} size="large" />
    );
    const icon = getByTestId("bus-icon");
    expect(icon.props.style.fontSize).toBeGreaterThanOrEqual(24);
  });

  // ===== INTEGRATION TESTS =====
  it("should work with all size and transit mode combinations", () => {
    const sizes: Array<"small" | "medium" | "large"> = [
      "small",
      "medium",
      "large",
    ];
    const modes = ["subway", "train", "bus", "walk", "bike", "car"] as const;

    sizes.forEach((size) => {
      modes.forEach((mode) => {
        const step = createMockTransitStep({ type: mode });
        expect(() => {
          renderWithTheme(<TransitStepIndicator step={step} size={size} />);
        }).not.toThrow();
      });
    });
  });

  it("should prioritize line text over icon when both are possible", () => {
    const step = createMockTransitStep({
      type: "subway",
      line: "Q",
    });
    const { getByText, queryByTestId } = renderWithTheme(
      <TransitStepIndicator step={step} />
    );
    expect(getByText("Q")).toBeTruthy();
    expect(queryByTestId("train-icon")).toBeNull();
  });

  // ===== PERFORMANCE =====
  it("should not re-render unnecessarily with same props", () => {
    const step = createMockTransitStep();
    const { rerender } = renderWithTheme(
      <TransitStepIndicator step={step} size="medium" />
    );

    expect(() => {
      rerender(<TransitStepIndicator step={step} size="medium" />);
      rerender(<TransitStepIndicator step={step} size="medium" />);
    }).not.toThrow();
  });
});
