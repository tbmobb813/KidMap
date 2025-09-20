import { render, waitFor } from "@testing-library/react-native";
import React from "react";

import { createTestWrapper } from "@/_tests_/testUtils";
import OptimizedImage from "@/components/OptimizedImage";

// ===== MOCKS =====
jest.mock("lucide-react-native", () => ({
  ImageOff: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "image-off-icon",
      children: `📷`,
      style: { fontSize: size, color },
      ...props,
    }),
}));

// Mock expo-image with URI-based triggering
jest.mock("expo-image", () => {
  const React = require("react");
  const { View } = require("react-native");

  const MockImage = React.forwardRef((props: any, ref: any) => {
    const { source, onLoad, onError } = props;

    React.useEffect(() => {
      // Check URI to determine what to trigger
      if (source?.uri?.includes("trigger-error")) {
        setTimeout(() => onError?.(), 10);
      } else if (source?.uri?.includes("trigger-load")) {
        setTimeout(() => onLoad?.(), 10);
      }
    }, [source, onLoad, onError]);

    return View({
      ref,
      testID: "expo-image",
      style: props.style,
      // Expose props for testing
      "data-source": JSON.stringify(props.source),
      "data-contentfit": props.contentFit,
      "data-placeholder": props.placeholder,
      "data-cachepolicy": props.cachePolicy,
    });
  });

  MockImage.displayName = "MockImage";
  return { Image: MockImage };
});

// Helper to render with theme wrapper by default
const renderWithTheme = (component: React.ReactElement, options: any = {}) => {
  return render(component, { wrapper: createTestWrapper(), ...options });
};

describe("OptimizedImage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== SMOKE TESTS =====
  it("should render without errors", () => {
    const { getByTestId } = renderWithTheme(
      <OptimizedImage source={{ uri: "https://example.com/image.png" }} />
    );
    expect(getByTestId("expo-image")).toBeTruthy();
  });

  // ===== PROP VERIFICATION =====
  it("should render with basic required props", () => {
    const testProps = {
      source: { uri: "https://example.com/image.png" },
    };

    const { getByTestId } = renderWithTheme(<OptimizedImage {...testProps} />);
    const image = getByTestId("expo-image");

    expect(image).toBeTruthy();
    expect(image.props["data-source"]).toBe(JSON.stringify(testProps.source));
  });

  it("should pass through style props", () => {
    const testStyle = { width: 100, height: 100, borderRadius: 8 };
    const { getByTestId } = renderWithTheme(
      <OptimizedImage
        source={{ uri: "https://example.com/image.png" }}
        style={testStyle}
      />
    );

    // The OptimizedImage renders: <View style={style}><Image .../></View>
    // The parent container should exist and receive the style prop
    const image = getByTestId("expo-image");
    const container = image.parent;

    expect(container).toBeTruthy();
    expect(container.props.style).toBeDefined();
  });

  // ===== CALLBACK TESTS =====
  it("should call onLoad callback when image loads successfully", async () => {
    const onLoadMock = jest.fn();

    renderWithTheme(
      <OptimizedImage
        source={{ uri: "https://example.com/trigger-load.png" }}
        onLoad={onLoadMock}
      />
    );

    await waitFor(() => {
      expect(onLoadMock).toHaveBeenCalled();
    });
  });

  it("should call onError callback when image fails to load", async () => {
    const onErrorMock = jest.fn();

    renderWithTheme(
      <OptimizedImage
        source={{ uri: "https://example.com/trigger-error.png" }}
        onError={onErrorMock}
      />
    );

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledTimes(1);
    });
  });

  // ===== ERROR STATE TESTS =====
  it("should show error state when image fails to load", async () => {
    const { getByTestId } = renderWithTheme(
      <OptimizedImage
        source={{ uri: "https://example.com/trigger-error.png" }}
      />
    );

    await waitFor(() => {
      expect(getByTestId("image-off-icon")).toBeTruthy();
    });
  });

  // ===== CONTENT FIT TESTS =====
  it("should apply cover contentFit by default", () => {
    const { getByTestId } = renderWithTheme(
      <OptimizedImage source={{ uri: "https://example.com/image.png" }} />
    );

    const image = getByTestId("expo-image");
    expect(image.props["data-contentfit"]).toBe("cover");
  });

  it("should apply custom contentFit when provided", () => {
    const { getByTestId } = renderWithTheme(
      <OptimizedImage
        source={{ uri: "https://example.com/image.png" }}
        contentFit="contain"
      />
    );

    const image = getByTestId("expo-image");
    expect(image.props["data-contentfit"]).toBe("contain");
  });

  // ===== PLACEHOLDER TESTS =====
  it("should apply placeholder when provided", () => {
    const placeholder = "https://example.com/placeholder.png";
    const { getByTestId } = renderWithTheme(
      <OptimizedImage
        source={{ uri: "https://example.com/image.png" }}
        placeholder={placeholder}
      />
    );

    const image = getByTestId("expo-image");
    expect(image.props["data-placeholder"]).toBe(placeholder);
  });

  // ===== THEME INTEGRATION =====
  it("should apply theme colors for error state", async () => {
    const { getByTestId } = renderWithTheme(
      <OptimizedImage
        source={{ uri: "https://example.com/trigger-error.png" }}
      />
    );

    await waitFor(() => {
      const errorIcon = getByTestId("image-off-icon");
      expect(errorIcon.props.style.color).toBeDefined();
    });
  });

  // ===== CALLBACK INTEGRATION =====
  it("should handle both onLoad and onError callbacks properly", async () => {
    const onLoadMock = jest.fn();
    const onErrorMock = jest.fn();

    const { rerender } = renderWithTheme(
      <OptimizedImage
        source={{ uri: "https://example.com/trigger-load.png" }}
        onLoad={onLoadMock}
        onError={onErrorMock}
      />
    );

    await waitFor(() => {
      expect(onLoadMock).toHaveBeenCalled();
      expect(onErrorMock).not.toHaveBeenCalled();
    });

    // Test error case
    rerender(
      <OptimizedImage
        source={{ uri: "https://example.com/trigger-error.png" }}
        onLoad={onLoadMock}
        onError={onErrorMock}
      />
    );

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalled();
    });
  });

  // ===== EDGE CASES =====
  it("should handle missing source gracefully", () => {
    const { getByTestId } = renderWithTheme(
      <OptimizedImage source={null as any} />
    );
    expect(getByTestId("expo-image")).toBeTruthy();
  });

  it("should handle local source (number)", () => {
    const { getByTestId } = renderWithTheme(<OptimizedImage source={123} />);

    const image = getByTestId("expo-image");
    expect(image.props["data-source"]).toBe("123");
  });

  // ===== PERFORMANCE =====
  it("should not re-render unnecessarily with same props", () => {
    const source = { uri: "https://example.com/image.png" };
    const { rerender } = renderWithTheme(<OptimizedImage source={source} />);

    // Re-render with same props should not cause issues
    expect(() => {
      rerender(<OptimizedImage source={source} />);
      rerender(<OptimizedImage source={source} />);
    }).not.toThrow();
  });
});
