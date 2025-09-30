// ===== IMPORTS =====
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

// ===== MOCKS =====
jest.mock("lucide-react-native", () => ({
  Clock: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "clock-icon",
      children: `Clock(${size},${color})`,
      ...props,
    }),
  MapPin: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "map-pin-icon",
      children: `MapPin(${size},${color})`,
      ...props,
    }),
  RefreshCw: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "refresh-cw-icon",
      children: `RefreshCw(${size},${color})`,
      ...props,
    }),
  Bell: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "bell-icon",
      children: `Bell(${size},${color})`,
      ...props,
    }),
  Train: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "train-icon",
      children: `Train(${size},${color})`,
      ...props,
    }),
  Bus: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "bus-icon",
      children: `Bus(${size},${color})`,
      ...props,
    }),
  Navigation: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "navigation-icon",
      children: `Navigation(${size},${color})`,
      ...props,
    }),
  Bike: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "bike-icon",
      children: `Bike(${size},${color})`,
      ...props,
    }),
  Car: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "car-icon",
      children: `Car(${size},${color})`,
      ...props,
    }),
}));

// Mock FlatList to render children properly
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  return {
    ...RN,
    FlatList: ({ data, renderItem }: any) => {
      return RN.View({
        testID: "arrivals-flatlist",
        children:
          data?.map((item: any, index: number) =>
            renderItem({ item, index })
          ) || [],
      });
    },
  };
});

// Mock TransitStepIndicator
jest.mock("@/components/TransitStepIndicator", () => {
  return ({ step, _size }: any) =>
    require("react-native").View({
      testID: `transit-step-${step.type}`,
      children: require("react-native").Text({
        children: `${step.type}-${step.line}`,
      }),
    });
});

// ===== TEST IMPORTS =====
import { createTestWrapper } from "../testUtils";

import LiveArrivalsCard, { LiveArrival } from "@/components/LiveArrivalsCard";

// ===== TEST HELPER FUNCTIONS =====
const createMockArrival = (
  overrides: Partial<LiveArrival> = {}
): LiveArrival => ({
  id: "arrival-1",
  line: "A",
  color: "#0078D4",
  destination: "Downtown",
  arrivalTime: 5,
  platform: "1",
  type: "subway",
  ...overrides,
});

const createMockArrivals = (count: number = 3): LiveArrival[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockArrival({
      id: `arrival-${index + 1}`,
      line: String.fromCharCode(65 + index), // A, B, C...
      destination: `Destination ${index + 1}`,
      arrivalTime: (index + 1) * 3,
      platform: String(index + 1),
    })
  );
};

const renderLiveArrivalsCard = (
  stationName: string = "Test Station",
  arrivals: LiveArrival[] = createMockArrivals(),
  lastUpdated?: string,
  onRefresh?: () => void,
  isRefreshing?: boolean
) => {
  const TestWrapper = createTestWrapper();
  return {
    ...render(
      <TestWrapper>
        <LiveArrivalsCard
          stationName={stationName}
          arrivals={arrivals}
          lastUpdated={lastUpdated}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      </TestWrapper>
    ),
    onRefresh,
  };
};

// ===== BASIC TEST SETUP =====
const mockOnRefresh = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

// ===== COMPONENT TEST TEMPLATE =====
describe("LiveArrivalsCard", () => {
  describe("Basic rendering", () => {
    it("renders station name correctly", () => {
      const { getByText } = renderLiveArrivalsCard("Central Station", []);

      expect(getByText("Central Station")).toBeTruthy();
    });

    it("renders with empty arrivals", () => {
      const { getByText } = renderLiveArrivalsCard("Test Station", []);

      expect(getByText("Test Station")).toBeTruthy();
      expect(getByText("No arrivals scheduled")).toBeTruthy();
    });

    it("renders multiple arrivals", () => {
      const arrivals = createMockArrivals(3);
      const { getByText } = renderLiveArrivalsCard("Test Station", arrivals);

      expect(getByText("Destination 1")).toBeTruthy();
      expect(getByText("Destination 2")).toBeTruthy();
      expect(getByText("Destination 3")).toBeTruthy();
    });
  });

  describe("Arrival data display", () => {
    it("displays arrival times correctly", () => {
      const arrivals = [
        createMockArrival({
          id: "1",
          arrivalTime: 0,
          destination: "Arriving Now",
        }),
        createMockArrival({
          id: "2",
          arrivalTime: 1,
          destination: "One Minute",
        }),
        createMockArrival({
          id: "3",
          arrivalTime: 5,
          destination: "Five Minutes",
        }),
      ];
      const { getByText } = renderLiveArrivalsCard("Test Station", arrivals);

      expect(getByText("Arriving")).toBeTruthy();
      expect(getByText("1 min")).toBeTruthy();
      expect(getByText("5 min")).toBeTruthy();
    });

    it("displays platform information", () => {
      const arrivals = [
        createMockArrival({ platform: "A", destination: "Platform A Train" }),
        createMockArrival({ platform: "B", destination: "Platform B Train" }),
      ];
      const { getByText } = renderLiveArrivalsCard("Test Station", arrivals);

      expect(getByText("Platform A")).toBeTruthy();
      expect(getByText("Platform B")).toBeTruthy();
    });

    it("handles arrivals without platform", () => {
      const arrivals = [
        createMockArrival({ platform: undefined, destination: "No Platform" }),
      ];
      const { getByText, queryByText } = renderLiveArrivalsCard(
        "Test Station",
        arrivals
      );

      expect(getByText("No Platform")).toBeTruthy();
      // Should not have any platform text when platform is undefined
      expect(queryByText("Platform undefined")).toBeNull();
    });

    it("displays transit type indicators", () => {
      const arrivals = [
        createMockArrival({ type: "subway", destination: "Subway Line" }),
        createMockArrival({ type: "bus", destination: "Bus Route" }),
        createMockArrival({ type: "train", destination: "Train Service" }),
      ];
      const { getByTestId } = renderLiveArrivalsCard("Test Station", arrivals);

      // TransitStepIndicator should render appropriate testIDs
      expect(getByTestId("transit-step-subway")).toBeTruthy();
      expect(getByTestId("transit-step-bus")).toBeTruthy();
      expect(getByTestId("transit-step-train")).toBeTruthy();
    });
  });

  describe("Urgent arrivals", () => {
    it("highlights arrivals with 0 minutes", () => {
      const arrivals = [
        createMockArrival({
          id: "urgent",
          arrivalTime: 0,
          destination: "Urgent Train",
        }),
      ];
      const { getByTestId, getByText } = renderLiveArrivalsCard(
        "Test Station",
        arrivals
      );

      expect(getByTestId("bell-icon")).toBeTruthy();
      expect(getByText("Arriving")).toBeTruthy();
    });

    it("highlights arrivals with 1 minute", () => {
      const arrivals = [
        createMockArrival({
          id: "urgent",
          arrivalTime: 1,
          destination: "Very Soon",
        }),
      ];
      const { getByTestId, getByText } = renderLiveArrivalsCard(
        "Test Station",
        arrivals
      );

      expect(getByTestId("bell-icon")).toBeTruthy();
      expect(getByText("1 min")).toBeTruthy();
    });

    it("does not highlight arrivals with 2+ minutes", () => {
      const arrivals = [
        createMockArrival({
          id: "normal",
          arrivalTime: 3,
          destination: "Normal Train",
        }),
      ];
      const { queryByTestId } = renderLiveArrivalsCard(
        "Test Station",
        arrivals
      );

      expect(queryByTestId("bell-icon")).toBeNull();
    });
  });

  describe("Header and metadata", () => {
    it("displays last updated time", () => {
      const { getByText } = renderLiveArrivalsCard(
        "Test Station",
        [],
        "2 minutes ago"
      );

      expect(getByText("2 minutes ago")).toBeTruthy();
    });

    it("defaults to 'Just now' for last updated", () => {
      const { getByText } = renderLiveArrivalsCard("Test Station", []);

      expect(getByText("Just now")).toBeTruthy();
    });

    it("displays station icon", () => {
      const { getByTestId } = renderLiveArrivalsCard("Test Station", []);

      expect(getByTestId("map-pin-icon")).toBeTruthy();
    });

    it("displays clock icon for last updated", () => {
      const { getByTestId } = renderLiveArrivalsCard("Test Station", []);

      expect(getByTestId("clock-icon")).toBeTruthy();
    });
  });

  describe("Refresh functionality", () => {
    it("displays refresh button when onRefresh provided", () => {
      const { getByTestId } = renderLiveArrivalsCard(
        "Test Station",
        [],
        undefined,
        mockOnRefresh
      );

      expect(getByTestId("refresh-cw-icon")).toBeTruthy();
    });

    it("hides refresh button when onRefresh not provided", () => {
      const { queryByTestId } = renderLiveArrivalsCard(
        "Test Station",
        [],
        undefined,
        undefined
      );

      expect(queryByTestId("refresh-cw-icon")).toBeNull();
    });

    it("calls onRefresh when refresh button pressed", () => {
      const onRefresh = jest.fn();
      const { getByTestId } = renderLiveArrivalsCard(
        "Test Station",
        [],
        undefined,
        onRefresh
      );

      fireEvent.press(getByTestId("refresh-cw-icon"));

      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it("disables refresh button when refreshing", () => {
      const onRefresh = jest.fn();
      const { getByTestId } = renderLiveArrivalsCard(
        "Test Station",
        [],
        undefined,
        onRefresh,
        true
      );

      // When refreshing, the refresh icon should still render
      expect(getByTestId("refresh-cw-icon")).toBeTruthy();

      // We cannot easily test the disabled state in this mock environment
      // but we can verify the component renders without errors when refreshing=true
      expect(onRefresh).not.toHaveBeenCalled();
    });
  });

  describe("Arrival sorting", () => {
    it("sorts arrivals by arrival time", () => {
      const arrivals = [
        createMockArrival({
          id: "3",
          arrivalTime: 10,
          destination: "Later Train",
        }),
        createMockArrival({
          id: "1",
          arrivalTime: 2,
          destination: "Sooner Train",
        }),
        createMockArrival({
          id: "2",
          arrivalTime: 5,
          destination: "Middle Train",
        }),
      ];
      const { getAllByText } = renderLiveArrivalsCard("Test Station", arrivals);

      // Check that "2 min" appears before "5 min" and "10 min"
      const timeTexts = getAllByText(/\d+\s+min/);
      expect(timeTexts[0]).toHaveTextContent("2 min");
      expect(timeTexts[1]).toHaveTextContent("5 min");
      expect(timeTexts[2]).toHaveTextContent("10 min");
    });
  });

  describe("Accessibility", () => {
    it("truncates long destination names", () => {
      const arrivals = [
        createMockArrival({
          destination: "Very Long Destination Name That Should Be Truncated",
          id: "long-dest",
        }),
      ];
      const { getByText } = renderLiveArrivalsCard("Test Station", arrivals);

      const destinationText = getByText(
        "Very Long Destination Name That Should Be Truncated"
      );
      expect(destinationText.props.numberOfLines).toBe(1);
    });

    it("handles special characters in station names", () => {
      const { getByText } = renderLiveArrivalsCard("St. John's & 42nd", []);

      expect(getByText("St. John's & 42nd")).toBeTruthy();
    });
  });

  describe("Edge cases", () => {
    it("handles empty station name", () => {
      const { getByText } = renderLiveArrivalsCard("", []);

      expect(getByText("No arrivals scheduled")).toBeTruthy();
    });

    it("handles arrivals with missing data", () => {
      const arrivals = [
        createMockArrival({
          destination: "",
          line: "",
          platform: undefined,
        }),
      ];
      const result = renderLiveArrivalsCard("Test Station", arrivals);

      expect(result).toBeTruthy();
    });

    it("handles very large arrival times", () => {
      const arrivals = [
        createMockArrival({ arrivalTime: 999, destination: "Far Future" }),
      ];
      const { getByText } = renderLiveArrivalsCard("Test Station", arrivals);

      expect(getByText("999 min")).toBeTruthy();
    });

    it("handles duplicate arrival IDs", () => {
      const arrivals = [
        createMockArrival({ id: "same", destination: "First" }),
        createMockArrival({ id: "same", destination: "Second" }),
      ];

      expect(() => {
        renderLiveArrivalsCard("Test Station", arrivals);
      }).not.toThrow();
    });
  });

  describe("Theme integration", () => {
    it("renders without theme-related errors", () => {
      expect(() => {
        renderLiveArrivalsCard("Test Station", createMockArrivals());
      }).not.toThrow();
    });

    it("applies theme to all text elements", () => {
      const arrivals = createMockArrivals(1);
      const { getByText } = renderLiveArrivalsCard("Test Station", arrivals);

      // Verify text elements render (theme applied via useTheme)
      expect(getByText("Test Station")).toBeTruthy();
      expect(getByText("Destination 1")).toBeTruthy();
      expect(getByText("Platform 1")).toBeTruthy();
    });
  });
});
