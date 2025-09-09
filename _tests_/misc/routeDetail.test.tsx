import { render as rtlRender } from "@testing-library/react-native";
import React from "react";

// Optionally, wrap with providers if your app uses them (e.g., ThemeProvider, QueryClientProvider)
const render = (ui: React.ReactElement, options?: any) => {
  return rtlRender(ui, options);
};

import RouteDetailScreen from "@/app/route/[id]";

// Mock expo-router useLocalSearchParams
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "r1" }),
}));

// Mock navigation store
jest.mock("@/stores/navigationStore", () => ({
  useNavigationStore: () => ({
    origin: {
      id: "o1",
      name: "Origin",
      address: "Addr",
      category: "other",
      coordinates: { latitude: 0, longitude: 0 },
    },
    destination: {
      id: "d1",
      name: "Destination",
      address: "Addr",
      category: "other",
      coordinates: { latitude: 1, longitude: 1 },
    },
    selectedRoute: null,
  }),
}));

// Mock routes query hook to return a consistent list
jest.mock("@/hooks/useRoutesQuery", () => ({
  useRoutesQuery: () => ({
    data: [
      {
        id: "r1",
        totalDuration: 10,
        departureTime: "10:00",
        arrivalTime: "10:10",
        steps: [
          {
            id: "s1",
            type: "walk",
            from: "Origin",
            to: "Destination",
            duration: 10,
          },
        ],
      },
    ],
  }),
}));

// Mock location hook
jest.mock("@/hooks/useLocation", () => () => ({
  location: { latitude: 0, longitude: 0, error: null },
  hasLocation: true,
}));

// Mock child components with simple placeholders to avoid complexity
jest.mock(
  "@/components/MapPlaceholder",
  () =>
    ({ _message }: any) =>
      null
);
jest.mock(
  "@/components/VoiceNavigation",
  () =>
    ({ _currentStep }: any) =>
      null
);
jest.mock("@/modules/safety/components/SafetyPanel", () => () => null);
jest.mock(
  "@/components/FeatureErrorBoundary",
  () =>
    ({ children }: any) =>
      children
);
jest.mock(
  "@/components/DirectionStep",
  () =>
    ({ _step }: any) =>
      null
);
jest.mock(
  "@/components/FunFactCard",
  () =>
    ({ _onDismiss }: any) =>
      null
);

describe("RouteDetailScreen", () => {
  it("renders route content when data available", () => {
    const { queryByText } = render(<RouteDetailScreen />);
    expect(queryByText("Route not found")).toBeNull();
  });

  it("renders fallback when route missing", () => {
    (jest.requireMock("@/stores/navigationStore").useNavigationStore as any) =
      () => ({ origin: null, destination: null, selectedRoute: null });
    (jest.requireMock("@/hooks/useRoutesQuery").useRoutesQuery as any) =
      () => ({ data: [] });
    const { getByText } = render(<RouteDetailScreen />);
    expect(getByText("Route not found")).toBeTruthy();
  });
});
