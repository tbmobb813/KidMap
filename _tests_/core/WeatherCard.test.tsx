import { act, render } from "@testing-library/react-native";
import React from "react";
import { Animated, Platform } from "react-native";

import { createTestWrapper } from "@/_tests_/testUtils";
import Toast from "@/components/Toast";

// ===== MOCKS =====
// URI-based mock triggering to avoid Jest module scope violations
jest.mock("lucide-react-native", () => ({
  Sun: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "weather-icon-sun",
      children: `☀️`,
      style: { fontSize: size, color },
      ...props,
    }),
  Cloud: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "weather-icon-cloud",
      children: `☁️`,
      style: { fontSize: size, color },
      ...props,
    }),
  CloudRain: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "weather-icon-rain",
      children: `🌧️`,
      style: { fontSize: size, color },
      ...props,
    }),
  Snowflake: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "weather-icon-snow",
      children: `❄️`,
      style: { fontSize: size, color },
      ...props,
    }),
  Wind: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "weather-icon-wind",
      children: `💨`,
      style: { fontSize: size, color },
      ...props,
    }),
}));

jest.mock("@/utils/accessibility/accessibility", () => ({
  announce: jest.fn(),
}));

jest.mock("react-native", () => {
  const actual = jest.requireActual("react-native");
  return {
    ...actual,
    Platform: { OS: "ios" },
    AccessibilityInfo: {
      ...actual.AccessibilityInfo,
      setAccessibilityFocus: jest.fn(),
    },
    findNodeHandle: jest.fn((ref) => (ref ? 123 : null)),
    Animated: {
      ...actual.Animated,
      timing: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback()),
      })),
      parallel: jest.fn((_animations) => ({
        start: jest.fn((callback) => callback && callback()),
      })),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
      })),
    },
  };
});

// ===== HELPER FUNCTIONS =====
const mockAnnounce = require("@/utils/accessibility/accessibility")
  .announce as jest.MockedFunction<any>;
const mockAnimatedTiming = Animated.timing as jest.MockedFunction<any>;
const mockAnimatedParallel = Animated.parallel as jest.MockedFunction<any>;

const createMockProps = (overrides: any = {}) => ({
  message: "Test message",
  type: "info" as const,
  visible: true,
  onHide: jest.fn(),
  ...overrides,
});

const renderWithTheme = (component: React.ReactElement, options: any = {}) => {
  return render(component, { wrapper: createTestWrapper(), ...options });
};

describe("Toast Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ===== SMOKE TESTS =====
  it("should render without errors when visible", () => {
    const props = createMockProps();
    const { getByTestId } = renderWithTheme(<Toast {...props} />);
    expect(getByTestId("toast-alert")).toBeTruthy();
  });

  it("should not render when not visible", () => {
    const props = createMockProps({ visible: false });
    const { queryByTestId } = renderWithTheme(<Toast {...props} />);
    expect(queryByTestId("toast-alert")).toBeNull();
  });

  // ===== PROP VERIFICATION =====
  it("should render with required props", () => {
    const props = createMockProps();
    const { getByTestId, getByText } = renderWithTheme(<Toast {...props} />);
    expect(getByTestId("toast-alert")).toBeTruthy();
    expect(getByText("Test message")).toBeTruthy();
  });

  it("should use default duration when not specified", () => {
    jest.spyOn(global, "setTimeout");
    const onHide = jest.fn();
    const props = createMockProps({ onHide });

    renderWithTheme(<Toast {...props} />);

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);
    jest.restoreAllMocks();
  });

  it("should use custom duration when specified", () => {
    jest.spyOn(global, "setTimeout");
    const onHide = jest.fn();
    const props = createMockProps({ onHide, duration: 5000 });

    renderWithTheme(<Toast {...props} />);

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
    jest.restoreAllMocks();
  });

  // ===== TOAST TYPE TESTS =====
  it("should render success icon for success type", () => {
    const props = createMockProps({ type: "success" });
    const { getByTestId } = renderWithTheme(<Toast {...props} />);
    expect(getByTestId("success-icon")).toBeTruthy();
  });

  it("should render error icon for error type", () => {
    const props = createMockProps({ type: "error" });
    const { getByTestId } = renderWithTheme(<Toast {...props} />);
    expect(getByTestId("error-icon")).toBeTruthy();
  });

  it("should render warning icon for warning type", () => {
    const props = createMockProps({ type: "warning" });
    const { getByTestId } = renderWithTheme(<Toast {...props} />);
    expect(getByTestId("warning-icon")).toBeTruthy();
  });

  it("should render info icon for info type", () => {
    const props = createMockProps({ type: "info" });
    const { getByTestId } = renderWithTheme(<Toast {...props} />);
    expect(getByTestId("info-icon")).toBeTruthy();
  });

  // ===== MESSAGE RENDERING TESTS =====
  it("should display the provided message", () => {
    const props = createMockProps({ message: "Custom toast message" });
    const { getByText } = renderWithTheme(<Toast {...props} />);
    expect(getByText("Custom toast message")).toBeTruthy();
  });

  it("should handle empty message", () => {
    const props = createMockProps({ message: "" });
    const { getByTestId } = renderWithTheme(<Toast {...props} />);
    expect(getByTestId("toast-alert")).toBeTruthy();
  });

  it("should handle long message", () => {
    const longMessage = "A".repeat(200);
    const props = createMockProps({ message: longMessage });
    const { getByText } = renderWithTheme(<Toast {...props} />);
    expect(getByText(longMessage)).toBeTruthy();
  });

  it("should handle special characters in message", () => {
    const specialMessage = '🎉 Success! "Action" completed & saved.';
    const props = createMockProps({ message: specialMessage });
    const { getByText } = renderWithTheme(<Toast {...props} />);
    expect(getByText(specialMessage)).toBeTruthy();
  });

  // ===== ANIMATION TESTS =====
  it("should trigger animations when visible becomes true", () => {
    const props = createMockProps({ visible: false });
    const { rerender } = renderWithTheme(<Toast {...props} />);

    act(() => {
      rerender(<Toast {...props} visible={true} />);
    });

    expect(mockAnimatedParallel).toHaveBeenCalled();
    expect(mockAnimatedTiming).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        toValue: 1,
        duration: 300,
      })
    );
  });

  it("should skip animations when disableAnimation is true", () => {
    const props = createMockProps({ disableAnimation: true });
    renderWithTheme(<Toast {...props} />);

    // Animation should not be triggered for initial render with disableAnimation
    expect(mockAnimatedParallel).not.toHaveBeenCalled();
  });

  it("should call onHide after hide animation completes", () => {
    const onHide = jest.fn();
    const props = createMockProps({ onHide });

    renderWithTheme(<Toast {...props} />);

    // Fast-forward past the duration
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onHide).toHaveBeenCalledTimes(1);
  });

  // ===== ACCESSIBILITY TESTS =====
  it("should announce message when visible", () => {
    const props = createMockProps({
      message: "Operation successful",
      type: "success",
      disableAnimation: true,
    });

    renderWithTheme(<Toast {...props} />);

    expect(mockAnnounce).toHaveBeenCalledWith("Success: Operation successful");
  });

  it("should announce different type labels correctly", () => {
    const testCases = [
      { type: "success", expected: "Success: Test" },
      { type: "error", expected: "Error: Test" },
      { type: "warning", expected: "Warning: Test" },
      { type: "info", expected: "Info: Test" },
    ] as const;

    testCases.forEach(({ type, expected }) => {
      mockAnnounce.mockClear();
      const props = createMockProps({
        message: "Test",
        type,
        disableAnimation: true,
      });

      renderWithTheme(<Toast {...props} />);

      expect(mockAnnounce).toHaveBeenCalledWith(expected);
    });
  });

  it("should have correct accessibility props", () => {
    const props = createMockProps({
      message: "Accessibility test",
      type: "warning",
    });
    const { getByTestId } = renderWithTheme(<Toast {...props} />);

    const toast = getByTestId("toast-alert");
    expect(toast.props.accessible).toBe(true);
    expect(toast.props.accessibilityRole).toBe("alert");
    expect(toast.props.accessibilityLabel).toBe("Warning: Accessibility test");
  });

  it("should call setTimeout for accessibility focus", () => {
    jest.spyOn(global, "setTimeout");
    const props = createMockProps({ visible: false, disableAnimation: false });
    const { rerender } = renderWithTheme(<Toast {...props} />);

    // Make toast visible to trigger the animation and focus logic
    rerender(<Toast {...props} visible={true} />);

    // Should have setTimeout calls for accessibility focus (50ms) and auto-hide (3000ms)
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 50);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);

    jest.restoreAllMocks();
  });

  // ===== LIFECYCLE TESTS =====
  it("should auto-hide after default duration", () => {
    const onHide = jest.fn();
    const props = createMockProps({ onHide });

    renderWithTheme(<Toast {...props} />);

    expect(onHide).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it("should auto-hide after custom duration", () => {
    const onHide = jest.fn();
    const props = createMockProps({ onHide, duration: 1500 });

    renderWithTheme(<Toast {...props} />);

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it("should not auto-hide when disableAnimation is true", () => {
    const onHide = jest.fn();
    const props = createMockProps({ onHide, disableAnimation: true });

    renderWithTheme(<Toast {...props} />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onHide).not.toHaveBeenCalled();
  });

  it("should cleanup timer when component unmounts", () => {
    const onHide = jest.fn();
    const props = createMockProps({ onHide });

    const { unmount } = renderWithTheme(<Toast {...props} />);

    unmount();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onHide).not.toHaveBeenCalled();
  });

  // ===== THEMING TESTS =====
  it("should apply theme colors to text", () => {
    const props = createMockProps();
    const { getByText } = renderWithTheme(<Toast {...props} />);

    const messageText = getByText("Test message");
    expect(messageText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: expect.any(String) }),
      ])
    );
  });

  it("should apply theme background color", () => {
    const props = createMockProps();
    const { getByTestId } = renderWithTheme(<Toast {...props} />);

    const toast = getByTestId("toast-alert");
    expect(toast.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: expect.any(String) }),
      ])
    );
  });

  // ===== EDGE CASES =====
  it("should handle visibility toggle correctly", async () => {
    const props = createMockProps({ visible: false });
    const { rerender, queryByTestId } = renderWithTheme(<Toast {...props} />);

    expect(queryByTestId("toast-alert")).toBeNull();

    await act(async () => {
      rerender(<Toast {...props} visible={true} />);
    });

    expect(queryByTestId("toast-alert")).toBeTruthy();

    await act(async () => {
      rerender(<Toast {...props} visible={false} />);
    });

    expect(queryByTestId("toast-alert")).toBeNull();
  });

  it("should handle rapid visibility changes", async () => {
    const onHide = jest.fn();
    const props = createMockProps({ visible: false, onHide });
    const { rerender } = renderWithTheme(<Toast {...props} />);

    // Rapidly toggle visibility
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        rerender(<Toast {...props} visible={true} />);
        rerender(<Toast {...props} visible={false} />);
      });
    }

    // Should handle without errors
    expect(onHide).not.toHaveBeenCalled();
  });

  it("should have accessibility focus logic when animations enabled", () => {
    jest.spyOn(global, "setTimeout");
    const props = createMockProps({ visible: false, disableAnimation: false });
    const { rerender } = renderWithTheme(<Toast {...props} />);

    // Make toast visible to trigger the animation and focus logic
    rerender(<Toast {...props} visible={true} />);

    // Verify the component renders and sets up timers
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 50);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);

    jest.restoreAllMocks();
  });

  // ===== PLATFORM SPECIFIC TESTS =====
  it("should handle web platform correctly", () => {
    const originalPlatform = Platform.OS;
    (Platform as any).OS = "web";

    const props = createMockProps();

    renderWithTheme(<Toast {...props} />);

    // Should render without errors on web
    expect(mockAnimatedTiming).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        useNativeDriver: false,
      })
    );

    (Platform as any).OS = originalPlatform;
  });

  // ===== INTEGRATION TESTS =====
  it("should work with real-world success scenario", async () => {
    const onHide = jest.fn();
    const props = createMockProps({
      message: "Profile saved successfully!",
      type: "success",
      duration: 2000,
      onHide,
    });

    const { getByTestId, getByText } = renderWithTheme(<Toast {...props} />);

    expect(getByTestId("success-icon")).toBeTruthy();
    expect(getByText("Profile saved successfully!")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it("should work with real-world error scenario", async () => {
    const props = createMockProps({
      message: "Network connection failed. Please try again.",
      type: "error",
      disableAnimation: true,
    });

    const { getByTestId, getByText } = renderWithTheme(<Toast {...props} />);

    expect(getByTestId("error-icon")).toBeTruthy();
    expect(
      getByText("Network connection failed. Please try again.")
    ).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(mockAnnounce).toHaveBeenCalledWith(
      "Error: Network connection failed. Please try again."
    );
  });

  // ===== PERFORMANCE =====
  it("should not re-announce on re-renders with same content", () => {
    const props = createMockProps({ disableAnimation: true });
    const { rerender } = renderWithTheme(<Toast {...props} />);

    rerender(<Toast {...props} />);
    rerender(<Toast {...props} />);

    // Should only announce once despite multiple renders
    expect(mockAnnounce).toHaveBeenCalledTimes(1);
  });

  it("should handle multiple toast types efficiently", () => {
    const types = ["success", "error", "warning", "info"] as const;

    types.forEach((type) => {
      const props = createMockProps({ type });
      expect(() => {
        renderWithTheme(<Toast {...props} />);
      }).not.toThrow();
    });
  });
});
