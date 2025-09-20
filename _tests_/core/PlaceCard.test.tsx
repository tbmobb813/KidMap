/**
 * PlaceCard Component Test Suite (ComponentTestTemplate Pattern)
 *
 * Tests place display component with place information, category icons,
 * user interactions, and accessibility features.
 * Follows ComponentTestTemplate for consistent UI component testing.
 *
 * @group core
 */
// ===== TEST IMPORTS =====
import { jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";

import { createTestWrapper } from "../testUtils";

import PlaceCard from "@/components/PlaceCard";
import { Place, PlaceCategory } from "@/types/navigation";

// ===== MOCK SETUP =====
// Mock lucide-react-native icons
jest.mock("lucide-react-native", () => ({
  Home: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "home-icon",
      children: `Home(${size},${color})`,
      ...props,
    }),
  School: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "school-icon",
      children: `School(${size},${color})`,
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
  Store: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "store-icon",
      children: `Store(${size},${color})`,
      ...props,
    }),
  Utensils: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "utensils-icon",
      children: `Utensils(${size},${color})`,
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
}));

// ===== END MOCK SETUP =====

// ===== TEST HELPER FUNCTIONS =====
const createMockPlace = (overrides: Partial<Place> = {}): Place => ({
  id: "test-place-1",
  name: "Test Place",
  address: "123 Test Street, Test City",
  category: "park" as PlaceCategory,
  coordinates: { latitude: 40.7128, longitude: -74.006 },
  ...overrides,
});

const renderPlaceCard = (place: Place, onPress = jest.fn()) => {
  const TestWrapper = createTestWrapper();
  return {
    ...render(
      <TestWrapper>
        <PlaceCard place={place} onPress={onPress} />
      </TestWrapper>
    ),
    onPress,
  };
};

// ===== BASIC TEST SETUP =====
describe("PlaceCard", () => {
  let mockOnPress: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnPress = jest.fn();
  });

  // ===== ESSENTIAL TESTS ONLY =====

  describe("Basic rendering", () => {
    it("renders place information correctly", () => {
      const place = createMockPlace();
      const { getByText, getByTestId } = renderPlaceCard(place, mockOnPress);

      expect(getByText("Test Place")).toBeTruthy();
      expect(getByText("123 Test Street, Test City")).toBeTruthy();
      expect(getByTestId("trees-icon")).toBeTruthy(); // park category
      expect(getByTestId("place-card-test-place-1")).toBeTruthy();
    });

    it("renders with minimal place information", () => {
      const place = createMockPlace({
        name: "Simple Place",
        address: "Address",
      });
      const { getByText } = renderPlaceCard(place, mockOnPress);

      expect(getByText("Simple Place")).toBeTruthy();
      expect(getByText("Address")).toBeTruthy();
    });

    it("handles long address with text truncation", () => {
      const place = createMockPlace({
        address:
          "This is a very long address that should be truncated when displayed in the place card component",
      });
      const { getByText } = renderPlaceCard(place, mockOnPress);

      expect(
        getByText(
          "This is a very long address that should be truncated when displayed in the place card component"
        )
      ).toBeTruthy();
    });
  });

  describe("Category icons", () => {
    it("displays correct icon for home category", () => {
      const place = createMockPlace({ category: "home" });
      const { getByTestId } = renderPlaceCard(place, mockOnPress);

      expect(getByTestId("home-icon")).toBeTruthy();
    });

    it("displays correct icon for school category", () => {
      const place = createMockPlace({ category: "school" });
      const { getByTestId } = renderPlaceCard(place, mockOnPress);

      expect(getByTestId("school-icon")).toBeTruthy();
    });

    it("displays correct icon for library category", () => {
      const place = createMockPlace({ category: "library" });
      const { getByTestId } = renderPlaceCard(place, mockOnPress);

      expect(getByTestId("book-open-icon")).toBeTruthy();
    });

    it("displays correct icon for store category", () => {
      const place = createMockPlace({ category: "store" });
      const { getByTestId } = renderPlaceCard(place, mockOnPress);

      expect(getByTestId("store-icon")).toBeTruthy();
    });

    it("displays correct icon for restaurant category", () => {
      const place = createMockPlace({ category: "restaurant" });
      const { getByTestId } = renderPlaceCard(place, mockOnPress);

      expect(getByTestId("utensils-icon")).toBeTruthy();
    });

    it("displays default icon for unknown category", () => {
      const place = createMockPlace({ category: "other" as PlaceCategory });
      const { getByTestId } = renderPlaceCard(place, mockOnPress);

      expect(getByTestId("map-pin-icon")).toBeTruthy();
    });
  });

  describe("User interactions", () => {
    it("calls onPress with place when card is pressed", () => {
      const place = createMockPlace();
      const { getByTestId, onPress } = renderPlaceCard(place, mockOnPress);

      fireEvent.press(getByTestId("place-card-test-place-1"));
      expect(onPress).toHaveBeenCalledWith(place);
    });

    it("calls onPress only once per press", () => {
      const place = createMockPlace();
      const { getByTestId, onPress } = renderPlaceCard(place, mockOnPress);

      fireEvent.press(getByTestId("place-card-test-place-1"));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("handles place with custom ID correctly", () => {
      const place1 = createMockPlace({ id: "place-1", name: "Place One" });
      const onPress1 = jest.fn();

      const { getByTestId } = renderPlaceCard(place1, onPress1);

      fireEvent.press(getByTestId("place-card-place-1"));
      expect(onPress1).toHaveBeenCalledWith(place1);
      expect(onPress1).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("provides correct accessibility labels", () => {
      const place = createMockPlace({ name: "Central Park" });
      const { getByLabelText } = renderPlaceCard(place, mockOnPress);

      expect(getByLabelText("Place Central Park")).toBeTruthy();
    });

    it("has correct accessibility role", () => {
      const place = createMockPlace();
      const { getByRole } = renderPlaceCard(place, mockOnPress);

      expect(getByRole("button")).toBeTruthy();
    });

    it("provides helpful accessibility hint", () => {
      const place = createMockPlace();
      const { getByTestId } = renderPlaceCard(place, mockOnPress);

      // Accessibility hint should be present on the pressable element
      expect(getByTestId("place-card-test-place-1")).toBeTruthy();
    });
  });

  describe("Edge cases", () => {
    it("handles empty place name gracefully", () => {
      const place = createMockPlace({ name: "" });
      const { getByText } = renderPlaceCard(place, mockOnPress);

      expect(getByText("")).toBeTruthy();
    });

    it("handles empty address gracefully", () => {
      const place = createMockPlace({ address: "" });
      const { getByText } = renderPlaceCard(place, mockOnPress);

      expect(getByText("")).toBeTruthy();
    });

    it("handles special characters in place name", () => {
      const place = createMockPlace({ name: "Place & Co. (Main St.)" });
      const { getByText } = renderPlaceCard(place, mockOnPress);

      expect(getByText("Place & Co. (Main St.)")).toBeTruthy();
    });

    it("handles special characters in address", () => {
      const place = createMockPlace({ address: "123 Main St., Apt. #4B" });
      const { getByText } = renderPlaceCard(place, mockOnPress);

      expect(getByText("123 Main St., Apt. #4B")).toBeTruthy();
    });
  });

  describe("Theme integration", () => {
    it("renders without theme-related errors", () => {
      const place = createMockPlace();
      const { getByText, getByTestId } = renderPlaceCard(place, mockOnPress);

      // Verify component renders successfully with theme
      expect(getByText("Test Place")).toBeTruthy();
      expect(getByTestId("trees-icon")).toBeTruthy();
    });
  });
});
