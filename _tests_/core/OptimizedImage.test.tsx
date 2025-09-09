import { waitFor } from "@testing-library/react-native";

import OptimizedImage from "../../components/OptimizedImage";
import { render, testThemeToggling } from "../testUtils";

jest.mock("expo-image", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MockImage = React.forwardRef((props: any, ref: any) => {
    const { onLoad } = props;
    React.useEffect(() => {
      const timeout = setTimeout(() => {
        if (onLoad) {
          onLoad();
        }
      }, 100);
      return () => clearTimeout(timeout);
    }, [onLoad]);
    return View({ ref, testID: "expo-image", style: props.style });
  });
  MockImage.displayName = "MockImage";
  return { Image: MockImage };
});

describe("OptimizedImage", () => {
  const mockOnLoad = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders without crashing", () => {
    render(
      <OptimizedImage source={{ uri: "https://example.com/image.jpg" }} />
    );
  });
  it("renders with loading indicator initially", () => {
    const { getByTestId } = render(
      <OptimizedImage
        source={{ uri: "https://example.com/image.jpg" }}
        onLoad={mockOnLoad}
      />
    );
    expect(getByTestId("expo-image")).toBeTruthy();
  });
  it("calls onLoad callback when image loads", async () => {
    render(
      <OptimizedImage
        source={{ uri: "https://example.com/image.jpg" }}
        onLoad={mockOnLoad}
      />
    );
    await waitFor(() => {
      expect(mockOnLoad).toHaveBeenCalled();
    });
  });
  it("supports all themes", () => {
    testThemeToggling(OptimizedImage, {
      source: { uri: "https://example.com/image.jpg" },
    });
  });
});
