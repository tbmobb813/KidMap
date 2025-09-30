/**
 * SearchBar Component Test Suite (ComponentTestTemplate Pattern)
 *
 * Tests search input component with text input handling, search functionality,
 * clear actions, and user interactions.
 * Follows ComponentTestTemplate for consistent UI component testing.
 *
 * @group core
 */
// ===== TEST IMPORTS =====
import { jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";

import { createTestWrapper } from "../testUtils";

import SearchBar from "@/components/SearchBar";

// ===== MOCK SETUP =====
// Mock lucide-react-native icons
jest.mock("lucide-react-native", () => ({
  Search: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "search-icon",
      children: `Search(${size},${color})`,
      ...props,
    }),
  X: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "clear-icon",
      children: `X(${size},${color})`,
      ...props,
    }),
}));

// ===== END MOCK SETUP =====

// ===== TEST HELPER FUNCTIONS =====
const renderSearchBar = (
  value: string = "",
  onChangeText = jest.fn(),
  onClear = jest.fn(),
  placeholder?: string
) => {
  const TestWrapper = createTestWrapper();
  return {
    ...render(
      <TestWrapper>
        <SearchBar
          value={value}
          onChangeText={onChangeText}
          onClear={onClear}
          placeholder={placeholder}
        />
      </TestWrapper>
    ),
    onChangeText,
    onClear,
  };
};

// ===== BASIC TEST SETUP =====
describe("SearchBar", () => {
  let mockOnChangeText: jest.Mock;
  let mockOnClear: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnChangeText = jest.fn();
    mockOnClear = jest.fn();
  });

  // ===== ESSENTIAL TESTS ONLY =====

  describe("Basic rendering", () => {
    it("renders search bar correctly", () => {
      const { getByTestId, getByPlaceholderText } = renderSearchBar(
        "",
        mockOnChangeText,
        mockOnClear
      );

      expect(getByTestId("search-icon")).toBeTruthy();
      expect(getByPlaceholderText("Where do you want to go?")).toBeTruthy();
    });

    it("renders with custom placeholder", () => {
      const { getByPlaceholderText } = renderSearchBar(
        "",
        mockOnChangeText,
        mockOnClear,
        "Search for places..."
      );

      expect(getByPlaceholderText("Search for places...")).toBeTruthy();
    });

    it("displays current value correctly", () => {
      const { getByDisplayValue } = renderSearchBar(
        "test search",
        mockOnChangeText,
        mockOnClear
      );

      expect(getByDisplayValue("test search")).toBeTruthy();
    });
  });

  describe("Text input functionality", () => {
    it("calls onChangeText when text is entered", () => {
      const { getByPlaceholderText, onChangeText } = renderSearchBar(
        "",
        mockOnChangeText,
        mockOnClear
      );
      const input = getByPlaceholderText("Where do you want to go?");

      fireEvent.changeText(input, "new search text");
      expect(onChangeText).toHaveBeenCalledWith("new search text");
    });

    it("handles empty text input", () => {
      const { getByPlaceholderText, onChangeText } = renderSearchBar(
        "",
        mockOnChangeText,
        mockOnClear
      );
      const input = getByPlaceholderText("Where do you want to go?");

      fireEvent.changeText(input, "");
      expect(onChangeText).toHaveBeenCalledWith("");
    });

    it("handles multiple text changes", () => {
      const { getByPlaceholderText, onChangeText } = renderSearchBar(
        "",
        mockOnChangeText,
        mockOnClear
      );
      const input = getByPlaceholderText("Where do you want to go?");

      fireEvent.changeText(input, "first");
      fireEvent.changeText(input, "second");

      expect(onChangeText).toHaveBeenCalledTimes(2);
      expect(onChangeText).toHaveBeenNthCalledWith(1, "first");
      expect(onChangeText).toHaveBeenNthCalledWith(2, "second");
    });
  });

  describe("Clear functionality", () => {
    it("shows clear button when value is not empty", () => {
      const { getByTestId } = renderSearchBar(
        "some text",
        mockOnChangeText,
        mockOnClear
      );

      expect(getByTestId("clear-icon")).toBeTruthy();
    });

    it("hides clear button when value is empty", () => {
      const { queryByTestId } = renderSearchBar(
        "",
        mockOnChangeText,
        mockOnClear
      );

      expect(queryByTestId("clear-icon")).toBeFalsy();
    });

    it("calls onClear when clear button is pressed", () => {
      const { getByTestId, onClear } = renderSearchBar(
        "text to clear",
        mockOnChangeText,
        mockOnClear
      );

      fireEvent.press(getByTestId("clear-icon"));
      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe("User interactions", () => {
    it("allows focus on text input", () => {
      const { getByPlaceholderText } = renderSearchBar(
        "",
        mockOnChangeText,
        mockOnClear
      );
      const input = getByPlaceholderText("Where do you want to go?");

      fireEvent(input, "focus");
      // Focus event should not throw
      expect(input).toBeTruthy();
    });

    it("handles blur on text input", () => {
      const { getByPlaceholderText } = renderSearchBar(
        "",
        mockOnChangeText,
        mockOnClear
      );
      const input = getByPlaceholderText("Where do you want to go?");

      fireEvent(input, "blur");
      // Blur event should not throw
      expect(input).toBeTruthy();
    });
  });

  describe("Edge cases", () => {
    it("handles very long text input", () => {
      const longText = "a".repeat(1000);
      const { getByPlaceholderText, onChangeText } = renderSearchBar(
        "",
        mockOnChangeText,
        mockOnClear
      );
      const input = getByPlaceholderText("Where do you want to go?");

      fireEvent.changeText(input, longText);
      expect(onChangeText).toHaveBeenCalledWith(longText);
    });

    it("handles special characters in input", () => {
      const specialText = "!@#$%^&*()_+{}|:<>?[]\\;',./`~";
      const { getByPlaceholderText, onChangeText } = renderSearchBar(
        "",
        mockOnChangeText,
        mockOnClear
      );
      const input = getByPlaceholderText("Where do you want to go?");

      fireEvent.changeText(input, specialText);
      expect(onChangeText).toHaveBeenCalledWith(specialText);
    });
  });

  describe("Theme integration", () => {
    it("renders without theme-related errors", () => {
      const { getByTestId, getByPlaceholderText } = renderSearchBar(
        "",
        mockOnChangeText,
        mockOnClear
      );

      // Verify component renders successfully with theme
      expect(getByTestId("search-icon")).toBeTruthy();
      expect(getByPlaceholderText("Where do you want to go?")).toBeTruthy();
    });
  });
});
