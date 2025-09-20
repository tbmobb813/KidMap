/**
 * CategoryButton Component Test Suite (ComponentTestTemplate Pattern)
 *
 * Tests category button component with icon mapping, category types, size variations,
 * accessibility features, and user interactions.
 * Follows ComponentTestTemplate for consistent UI component testing.
 *
 * @group core
 */
// ===== MOCK SETUP =====
import { jest } from "@jest/globals";
// Mock lucide-react-native icons (extensive icon set)
jest.mock("lucide-react-native", () => ({
  Home: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "home-icon",
      children: `Home(${size},${color})`,
      ...props,
    }),
  GraduationCap: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "graduation-cap-icon",
      children: `GraduationCap(${size},${color})`,
      ...props,
    }),
  BookOpen: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "book-open-icon",
      children: `BookOpen(${size},${color})`,
      ...props,
    }),
  Trees: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "trees-icon",
      children: `Trees(${size},${color})`,
      ...props,
    }),
  ShoppingBag: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "shopping-bag-icon",
      children: `ShoppingBag(${size},${color})`,
      ...props,
    }),
  Pizza: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "pizza-icon",
      children: `Pizza(${size},${color})`,
      ...props,
    }),
  Users: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "users-icon",
      children: `Users(${size},${color})`,
      ...props,
    }),
  Heart: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "heart-icon",
      children: `Heart(${size},${color})`,
      ...props,
    }),
  MapPin: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "map-pin-icon",
      children: `MapPin(${size},${color})`,
      ...props,
    }),
  // Add other icons as needed for comprehensive testing
}));

// Mock accessibility audit utility
jest.mock("@/utils/accessibility/touchTargetAudit", () => ({
  auditTouchTarget: jest.fn(),
}));

// ===== TEST IMPORTS =====
import { fireEvent, render } from "@testing-library/react-native";
import { createTestWrapper } from "../testUtils";

import CategoryButton from "@/components/CategoryButton";
import { CustomCategory, PlaceCategory } from "@/types/navigation";

// ===== TEST HELPER FUNCTIONS =====
const createMockCustomCategory = (
  overrides: Partial<CustomCategory> = {}
): CustomCategory => ({
  id: "custom-1",
  name: "Custom Place",
  icon: "Home",
  color: "#FF5733",
  isDefault: false,
  createdBy: "parent",
  isApproved: true,
  createdAt: Date.now(),
  ...overrides,
});

const renderCategoryButton = (
  category?: PlaceCategory,
  customCategory?: CustomCategory,
  onPress = jest.fn(),
  size: "small" | "medium" | "large" = "large"
) => {
  const TestWrapper = createTestWrapper();
  return {
    ...render(
      <TestWrapper>
        <CategoryButton
          category={category}
          customCategory={customCategory}
          onPress={onPress}
          size={size}
        />
      </TestWrapper>
    ),
    onPress,
  };
};

// ===== BASIC TEST SETUP =====
describe("CategoryButton", () => {
  let mockOnPress: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnPress = jest.fn();
  });

  // ===== ESSENTIAL TESTS ONLY =====

  describe("Basic rendering", () => {
    it("renders standard category button correctly", () => {
      const { getByText, getByTestId } = renderCategoryButton(
        "home",
        undefined,
        mockOnPress
      );

      expect(getByText("Home")).toBeTruthy();
      expect(getByTestId("home-icon")).toBeTruthy();
      expect(getByTestId("category-button-home")).toBeTruthy();
    });

    it("renders custom category button correctly", () => {
      const customCategory = createMockCustomCategory({
        name: "My Custom Place",
        icon: "Heart",
      });
      const { getByText, getByTestId } = renderCategoryButton(
        undefined,
        customCategory,
        mockOnPress
      );

      expect(getByText("My Custom Place")).toBeTruthy();
      expect(getByTestId("heart-icon")).toBeTruthy();
      expect(getByTestId("category-button-custom-1")).toBeTruthy();
    });

    it("renders with default category when no category provided", () => {
      const { getByText, getByTestId } = renderCategoryButton(
        undefined,
        undefined,
        mockOnPress
      );

      expect(getByText("Other")).toBeTruthy();
      expect(getByTestId("map-pin-icon")).toBeTruthy();
    });
  });

  describe("Category types", () => {
    it("renders different standard categories correctly", () => {
      const categories: PlaceCategory[] = [
        "school",
        "park",
        "library",
        "store",
        "restaurant",
        "friend",
        "family",
      ];

      categories.forEach((category) => {
        const { getByTestId } = renderCategoryButton(
          category,
          undefined,
          mockOnPress
        );
        expect(getByTestId(`category-button-${category}`)).toBeTruthy();
      });
    });

    it("displays correct icons for standard categories", () => {
      const { getByTestId: getSchoolIcon } = renderCategoryButton(
        "school",
        undefined,
        mockOnPress
      );
      expect(getSchoolIcon("graduation-cap-icon")).toBeTruthy();

      const { getByTestId: getParkIcon } = renderCategoryButton(
        "park",
        undefined,
        mockOnPress
      );
      expect(getParkIcon("trees-icon")).toBeTruthy();

      const { getByTestId: getLibraryIcon } = renderCategoryButton(
        "library",
        undefined,
        mockOnPress
      );
      expect(getLibraryIcon("book-open-icon")).toBeTruthy();
    });
  });

  describe("Size variations", () => {
    it("renders small size correctly", () => {
      const { getByTestId } = renderCategoryButton(
        "home",
        undefined,
        mockOnPress,
        "small"
      );
      expect(getByTestId("category-button-home")).toBeTruthy();
    });

    it("renders medium size correctly", () => {
      const { getByTestId } = renderCategoryButton(
        "home",
        undefined,
        mockOnPress,
        "medium"
      );
      expect(getByTestId("category-button-home")).toBeTruthy();
    });

    it("renders large size correctly (default)", () => {
      const { getByTestId } = renderCategoryButton(
        "home",
        undefined,
        mockOnPress,
        "large"
      );
      expect(getByTestId("category-button-home")).toBeTruthy();
    });
  });

  describe("User interactions", () => {
    it("calls onPress with correct category when pressed", () => {
      const { getByTestId, onPress } = renderCategoryButton(
        "home",
        undefined,
        mockOnPress
      );

      fireEvent.press(getByTestId("category-button-home"));
      expect(onPress).toHaveBeenCalledWith("home");
    });

    it("calls onPress with custom category id when custom category pressed", () => {
      const customCategory = createMockCustomCategory({
        id: "custom-place-123",
      });
      const { getByTestId, onPress } = renderCategoryButton(
        undefined,
        customCategory,
        mockOnPress
      );

      fireEvent.press(getByTestId("category-button-custom-place-123"));
      expect(onPress).toHaveBeenCalledWith("custom-place-123");
    });

    it("calls onPress with 'other' when no category specified", () => {
      const { getByTestId, onPress } = renderCategoryButton(
        undefined,
        undefined,
        mockOnPress
      );

      fireEvent.press(getByTestId("category-button-undefined"));
      expect(onPress).toHaveBeenCalledWith("other");
    });
  });

  describe("Accessibility", () => {
    it("provides correct accessibility labels", () => {
      const { getByLabelText } = renderCategoryButton(
        "home",
        undefined,
        mockOnPress
      );

      expect(getByLabelText("Home category button")).toBeTruthy();
    });

    it("provides correct accessibility labels for custom categories", () => {
      const customCategory = createMockCustomCategory({
        name: "Special Place",
      });
      const { getByLabelText } = renderCategoryButton(
        undefined,
        customCategory,
        mockOnPress
      );

      expect(getByLabelText("Special Place category button")).toBeTruthy();
    });

    it("has correct accessibility role", () => {
      const { getByRole } = renderCategoryButton(
        "home",
        undefined,
        mockOnPress
      );

      expect(getByRole("button")).toBeTruthy();
    });
  });

  describe("Theme integration", () => {
    it("renders without theme-related errors", () => {
      const { getByText, getByTestId } = renderCategoryButton(
        "home",
        undefined,
        mockOnPress
      );

      // Verify component renders successfully with theme
      expect(getByText("Home")).toBeTruthy();
      expect(getByTestId("home-icon")).toBeTruthy();
    });
  });
});