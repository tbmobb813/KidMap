import React from "react";

import RegionalTransitCard from "../../components/RegionalTransitCard";
import { render as customRender } from "../testUtils";

// ===== MOCKS =====
jest.mock("lucide-react-native", () => ({
  Train: ({ _size, _color, ...props }: any) =>
    require("react-native").Text({
      testID: "train-icon",
      children: `🚆`,
      ...props,
    }),
  Bus: ({ _size, _color, ...props }: any) =>
    require("react-native").Text({
      testID: "bus-icon",
      children: `🚌`,
      ...props,
    }),
  Navigation: ({ _size, _color, ...props }: any) =>
    require("react-native").Text({
      testID: "navigation-icon",
      children: `🧭`,
      ...props,
    }),
  Ship: ({ _size, _color, ...props }: any) =>
    require("react-native").Text({
      testID: "ship-icon",
      children: `🚢`,
      ...props,
    }),
}));

// Mock FlatList to render items directly
jest.mock("react-native", () => {
  const ActualReactNative = jest.requireActual("react-native");
  return {
    ...ActualReactNative,
    FlatList: ({ data, renderItem, keyExtractor, ...props }: any) => {
      const MockView = ActualReactNative.View;
      return (
        <MockView testID="mock-flatlist" {...props}>
          {data.map((item: any, index: number) => {
            const key = keyExtractor ? keyExtractor(item, index) : index;
            return <MockView key={key}>{renderItem({ item, index })}</MockView>;
          })}
        </MockView>
      );
    },
  };
});

// Mock region store with default data
jest.mock("@/stores/regionStore", () => ({
  useRegionStore: () => ({
    currentRegion: {
      id: "nyc",
      name: "New York City",
      country: "United States",
      emergencyNumber: "911",
    },
    getCurrentTransitSystems: () => [
      {
        id: "mta-subway",
        name: "MTA Subway",
        type: "subway",
        color: "#007cc3",
        routes: ["1", "2", "3", "4", "5", "6"],
      },
      {
        id: "mta-bus",
        name: "MTA Bus",
        type: "bus",
        color: "#0039a6",
        routes: ["M15", "M20", "M34"],
      },
      {
        id: "staten-island-ferry",
        name: "Staten Island Ferry",
        type: "ferry",
        color: "#ff6600",
        routes: ["SIR"],
      },
    ],
  }),
}));

const renderRegionalTransitCard = (props = {}) => {
  return customRender(<RegionalTransitCard {...props} />);
};

describe("RegionalTransitCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic rendering", () => {
    it("renders without crashing", () => {
      const { getByText } = renderRegionalTransitCard();
      expect(getByText("Transit Systems in New York City")).toBeTruthy();
    });

    it("displays region information correctly", () => {
      const { getByText } = renderRegionalTransitCard();

      expect(getByText("Transit Systems in New York City")).toBeTruthy();
      expect(getByText("United States")).toBeTruthy();
    });

    it("displays emergency number in footer", () => {
      const { getByText } = renderRegionalTransitCard();

      expect(getByText("Emergency: 911")).toBeTruthy();
    });
  });

  describe("Transit systems display", () => {
    it("renders all transit systems", () => {
      const { getByText } = renderRegionalTransitCard();

      expect(getByText("MTA Subway")).toBeTruthy();
      expect(getByText("MTA Bus")).toBeTruthy();
      expect(getByText("Staten Island Ferry")).toBeTruthy();
    });

    it("displays correct transit types", () => {
      const { getByText } = renderRegionalTransitCard();

      expect(getByText("Subway • 6 lines")).toBeTruthy();
      expect(getByText("Bus • 3 lines")).toBeTruthy();
      expect(getByText("Ferry • 1 lines")).toBeTruthy();
    });

    it("renders correct icons for each transit type", () => {
      const { getByTestId } = renderRegionalTransitCard();

      // Should have one train icon for subway system
      expect(getByTestId("train-icon")).toBeTruthy();

      // Should have one bus icon for bus system
      expect(getByTestId("bus-icon")).toBeTruthy();

      // Should have one ship icon for ferry system
      expect(getByTestId("ship-icon")).toBeTruthy();
    });
  });

  describe("Component structure", () => {
    it("renders main container", () => {
      const { getByText } = renderRegionalTransitCard();

      // Check that all main sections are present
      expect(getByText("Transit Systems in New York City")).toBeTruthy();
      expect(getByText("Emergency: 911")).toBeTruthy();
    });

    it("renders FlatList with transit systems", () => {
      const { getByTestId } = renderRegionalTransitCard();

      expect(getByTestId("mock-flatlist")).toBeTruthy();
    });

    it("renders header and footer sections", () => {
      const { getByText } = renderRegionalTransitCard();

      // Header section
      expect(getByText("Transit Systems in New York City")).toBeTruthy();
      expect(getByText("United States")).toBeTruthy();

      // Footer section
      expect(getByText("Emergency: 911")).toBeTruthy();
    });
  });

  describe("Transit type handling", () => {
    it("displays subway type correctly", () => {
      const { getByText } = renderRegionalTransitCard();

      expect(getByText("MTA Subway")).toBeTruthy();
      expect(getByText("Subway • 6 lines")).toBeTruthy();
    });

    it("displays bus type correctly", () => {
      const { getByText } = renderRegionalTransitCard();

      expect(getByText("MTA Bus")).toBeTruthy();
      expect(getByText("Bus • 3 lines")).toBeTruthy();
    });

    it("displays ferry type correctly", () => {
      const { getByText } = renderRegionalTransitCard();

      expect(getByText("Staten Island Ferry")).toBeTruthy();
      expect(getByText("Ferry • 1 lines")).toBeTruthy();
    });
  });

  describe("Icon verification", () => {
    it("renders train icon for subway", () => {
      const { getByTestId } = renderRegionalTransitCard();

      const trainIcon = getByTestId("train-icon");
      expect(trainIcon).toBeTruthy();
    });

    it("renders bus icon for bus system", () => {
      const { getByTestId } = renderRegionalTransitCard();

      const busIcon = getByTestId("bus-icon");
      expect(busIcon).toBeTruthy();
    });

    it("renders ship icon for ferry system", () => {
      const { getByTestId } = renderRegionalTransitCard();

      const shipIcon = getByTestId("ship-icon");
      expect(shipIcon).toBeTruthy();
    });
  });

  describe("Content validation", () => {
    it("displays all required transit information", () => {
      const { getByText } = renderRegionalTransitCard();

      // Verify all transit systems are displayed
      expect(getByText("MTA Subway")).toBeTruthy();
      expect(getByText("MTA Bus")).toBeTruthy();
      expect(getByText("Staten Island Ferry")).toBeTruthy();

      // Verify all route counts
      expect(getByText("Subway • 6 lines")).toBeTruthy();
      expect(getByText("Bus • 3 lines")).toBeTruthy();
      expect(getByText("Ferry • 1 lines")).toBeTruthy();
    });

    it("displays region metadata correctly", () => {
      const { getByText } = renderRegionalTransitCard();

      expect(getByText("Transit Systems in New York City")).toBeTruthy();
      expect(getByText("United States")).toBeTruthy();
      expect(getByText("Emergency: 911")).toBeTruthy();
    });
  });

  describe("Theme integration", () => {
    it("renders without theme-related errors", () => {
      const { getByText } = renderRegionalTransitCard();

      expect(getByText("Transit Systems in New York City")).toBeTruthy();
      expect(getByText("Emergency: 911")).toBeTruthy();
    });

    it("applies theme to all text elements", () => {
      const { getByText } = renderRegionalTransitCard();

      // All major text elements should render successfully
      expect(getByText("Transit Systems in New York City")).toBeTruthy();
      expect(getByText("United States")).toBeTruthy();
      expect(getByText("MTA Subway")).toBeTruthy();
      expect(getByText("Emergency: 911")).toBeTruthy();
    });
  });

  describe("Edge cases", () => {
    it("handles component rendering gracefully", () => {
      const { getByText } = renderRegionalTransitCard();

      // Test that basic functionality works
      expect(getByText("Transit Systems in New York City")).toBeTruthy();
      expect(getByText("MTA Subway")).toBeTruthy();
    });

    it("renders emergency information prominently", () => {
      const { getByText } = renderRegionalTransitCard();

      expect(getByText("Emergency: 911")).toBeTruthy();
    });
  });
});
