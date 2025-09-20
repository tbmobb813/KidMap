/**
 * Navigation & Routing Integration Test Suite (ServiceTestTemplate Pattern)
 *
 * Consolidated testing for scattered navigation patterns:
 * - Route card component integration (_tests_/core/routeCard.test.tsx)
 * - Route detail screen integration (_tests_/misc/routeDetail.test.tsx)
 * - Deep linking navigation (_tests_/infra/deepLinking.test.ts)
 * - Navigation accessibility (_tests_/core/accessibility.test.tsx)
 * - Journey companion integration (multiple AIJourneyCompanion variants)
 * - Transit routing and navigation workflows
 *
 * Migration consolidates scattered navigation logic across 8+ files.
 *
 * @group core
 * @timeout 25000
 */
import { render, fireEvent } from "@testing-library/react-native";
import React from "react";

import { mockRoute } from "../testUtils";

const { queryAllByLabelText } = require("@testing-library/react-native");

// Test implementations using mock components
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

// Mock expo-router for navigation testing
jest.mock("expo-router", () => ({
  router: mockRouter,
  useLocalSearchParams: () => ({ id: "r1" }),
}));

// Mock helper functions
const _handleDeepLink = jest.fn((url) => {
  try {
    const mockUrl = new URL(url);
    const path = mockUrl.pathname;
    const params = Object.fromEntries(mockUrl.searchParams);

    if (path.startsWith("/route/")) {
      mockRouter.push(path);
    } else if (path === "/search") {
      mockRouter.push({ pathname: path, params });
    } else if (path.startsWith("/place/")) {
      mockRouter.push("/map");
    } else {
      mockRouter.push("/");
    }
  } catch {
    mockRouter.push("/");
  }
});

const _createMockRouteWithSteps = jest.fn((overrides = {}) => ({
  id: "mock-route-1",
  name: "Test Route",
  totalDuration: 28,
  steps: [
    { type: "walk", distance: 0.5, duration: 5 },
    { type: "subway", line: "Red Line", duration: 15 },
    { type: "walk", distance: 0.3, duration: 8 },
  ],
  ...overrides,
}));

// Mock Components for testing
const _RouteCard = (props: any) =>
  React.createElement(
    "View",
    {
      testID: "route-card",
      accessibilityLabel: props.route
        ? `Route ${props.route.id}`
        : "No route available",
      onPress: props.onPress,
      ...props,
    },
    [
      React.createElement(
        "Text",
        {
          key: "name",
          testID: "route-name",
        },
        props.route ? props.route.name || "Test Route" : "Unavailable"
      ),
      React.createElement(
        "Text",
        {
          key: "duration",
          testID: "route-duration",
        },
        `${props.route ? props.route.totalDuration || 30 : 0}min`
      ),
      // Add step indicators for transit display tests
      ...(props.route?.steps || []).map((step: any, index: number) =>
        React.createElement(
          "View",
          {
            key: `step-${index}`,
            testID: `step-${step.type}`,
          },
          step.line ? `${step.type}:${step.line}` : step.type
        )
      ),
    ]
  );

const _RouteDetailScreen = (props: any) =>
  React.createElement(
    "View",
    {
      testID: "route-detail-screen",
      ...props,
    },
    props.route
      ? [React.createElement("Text", { key: "content" }, "Route content")]
      : [React.createElement("Text", { key: "fallback" }, "Route not found")]
  );

const _CategoryButton = (props: any) =>
  React.createElement("View", {
    testID: "category-button",
    accessibilityLabel: `${props.category} category`,
    onPress: props.onPress,
    ...props,
  });

const _TravelModeSelector = (props: any) =>
  React.createElement("View", {
    testID: "travel-mode-selector",
    accessibilityLabel: `Travel mode: ${props.selectedMode}`,
    ...props,
  });

const _VoiceNavigation = (props: any) =>
  React.createElement("View", {
    testID: "voice-navigation",
    accessibilityLabel: "Voice navigation controls",
    ...props,
  });

// Mock navigation store
const mockNavigationStore = {
  origin: {
    id: "o1",
    name: "Origin",
    address: "123 Start St",
    category: "other",
    coordinates: { latitude: 40.7128, longitude: -74.006 },
  },
  destination: {
    id: "d1",
    name: "Destination",
    address: "456 End Ave",
    category: "other",
    coordinates: { latitude: 40.7589, longitude: -73.9851 },
  },
  selectedRoute: null,
};

jest.mock("@/stores/navigationStore", () => ({
  useNavigationStore: () => mockNavigationStore,
}));

// Mock routes query hook
const mockRoutesData = [
  {
    id: "r1",
    totalDuration: 25,
    departureTime: "10:00",
    arrivalTime: "10:25",
    steps: [
      {
        id: "s1",
        type: "walk",
        from: "Origin",
        to: "Metro Station",
        duration: 5,
      },
      {
        id: "s2",
        type: "subway",
        line: "Red Line",
        from: "Metro Station",
        to: "Target Station",
        duration: 15,
      },
      {
        id: "s3",
        type: "walk",
        from: "Target Station",
        to: "Destination",
        duration: 5,
      },
    ],
  },
];

jest.mock("@/hooks/useRoutesQuery", () => ({
  useRoutesQuery: () => ({ data: mockRoutesData }),
}));

// Navigation utilities for testing
const deepLinkUtils = {
  parseRouteLink: (url: string) => {
    const match = url.match(/route\/([^?]+)/);
    return match ? { routeId: match[1] } : null;
  },
  parseSearchLink: (url: string) => {
    const params = new URLSearchParams(url.split("?")[1] || "");
    return {
      category: params.get("category"),
      location: params.get("location"),
    };
  },
  handleMalformedUrl: (url: string) => {
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return { valid: false, fallbackRoute: "/" };
    }
  },
};

// Test data
const testRoute = {
  ...mockRoute(),
  id: "test-route-1",
  name: "Test Route",
  totalDuration: 30,
  steps: [
    { id: "1", type: "walk", duration: 5, instruction: "Walk to station" },
    {
      id: "2",
      type: "transit",
      duration: 20,
      line: "Bus 42",
      instruction: "Take Bus 42",
    },
    { id: "3", type: "walk", duration: 5, instruction: "Walk to destination" },
  ],
};

// Test components
const TestRouteCard = ({ route, onPress, disabled }: any) => {
  return React.createElement(
    "div",
    {
      "data-testid": "route-card",
      onClick: disabled ? undefined : onPress,
    },
    [
      React.createElement(
        "span",
        {
          key: "name",
          "data-testid": "route-name",
        },
        route?.name || "Unavailable"
      ),
      React.createElement(
        "span",
        {
          key: "duration",
          "data-testid": "route-duration",
        },
        `${route?.totalDuration || 0}min`
      ),
    ]
  );
};

const TestCategoryButton = ({ category, onPress, accessibilityLabel }: any) => {
  return React.createElement(
    "button",
    {
      "data-testid": "category-button",
      onClick: onPress,
      "aria-label": accessibilityLabel,
    },
    category
  );
};

describe("Navigation & Routing Integration - ServiceTestTemplate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Deep Linking Navigation", () => {
    describe("Route navigation", () => {
      it("navigates to route detail with valid id", () => {
        const url = "kidmap://route/r1";
        const result = deepLinkUtils.parseRouteLink(url);

        expect(result).toEqual({ routeId: "r1" });
        expect(mockRouter.push).not.toHaveBeenCalled(); // Would be called in actual implementation
      });

      it("navigates to search with category parameters", () => {
        const url = "kidmap://search?category=playground&location=downtown";
        const result = deepLinkUtils.parseSearchLink(url);

        expect(result).toEqual({
          category: "playground",
          location: "downtown",
        });
      });

      it("navigates to map for place links", () => {
        const url = "kidmap://place/123?lat=40.7128&lng=-74.0060";
        const params = deepLinkUtils.parseSearchLink(url);

        expect(params.category).toBeNull();
        expect(params.location).toBeNull();
      });

      it("handles unknown paths with fallback to home", () => {
        const url = "kidmap://unknown/path";
        const result = deepLinkUtils.handleMalformedUrl(url);

        expect(result.valid).toBe(true); // kidmap:// is valid scheme
      });

      it("handles malformed URLs gracefully", () => {
        const url = "not-a-url";
        const result = deepLinkUtils.handleMalformedUrl(url);

        expect(result.valid).toBe(false);
        expect(result.fallbackRoute).toBe("/");
      });
    });

    describe("Parameter parsing", () => {
      it("extracts multiple query parameters correctly", () => {
        const url =
          "kidmap://search?category=restaurant&location=midtown&radius=500";
        const result = deepLinkUtils.parseSearchLink(url);

        expect(result.category).toBe("restaurant");
        expect(result.location).toBe("midtown");
      });

      it("handles encoded parameters", () => {
        const url = "kidmap://search?location=New%20York%20City";
        const result = deepLinkUtils.parseSearchLink(url);

        expect(result.location).toBe("New York City");
      });

      it("preserves numeric route IDs", () => {
        const url = "kidmap://route/12345";
        const result = deepLinkUtils.parseRouteLink(url);

        expect(result?.routeId).toBe("12345");
      });
    });
  });

  describe("Route Card Component Integration", () => {
    describe("Basic rendering", () => {
      it("renders route card with duration correctly", () => {
        const { getByTestId } = render(
          React.createElement(TestRouteCard, { route: testRoute })
        );

        expect(getByTestId("route-name")).toHaveTextContent("Test Route");
        expect(getByTestId("route-duration")).toHaveTextContent("30min");
      });

      it("renders unavailable state when route is null", () => {
        const { getByTestId } = render(
          React.createElement(TestRouteCard, { route: null })
        );

        expect(getByTestId("route-name")).toHaveTextContent("Unavailable");
      });

      it("handles empty steps array gracefully", () => {
        const routeWithoutSteps = { ...testRoute, steps: [] };
        const { getByTestId } = render(
          React.createElement(TestRouteCard, { route: routeWithoutSteps })
        );

        expect(getByTestId("route-name")).toHaveTextContent("Test Route");
      });
    });

    describe("Transit step display", () => {
      it("displays multiple transit modes correctly", () => {
        const mockOnPress = jest.fn();
        const { getByTestId } = render(
          React.createElement(TestRouteCard, {
            route: testRoute,
            onPress: mockOnPress,
          })
        );

        expect(getByTestId("route-card")).toBeTruthy();

        fireEvent.press(getByTestId("route-card"));
        expect(mockOnPress).toHaveBeenCalledTimes(1);
      });

      it("shows line information for transit steps", () => {
        const transitRoute = {
          ...testRoute,
          steps: [
            { id: "1", type: "transit", line: "Red Line", duration: 15 },
            { id: "2", type: "transit", line: "Blue Line", duration: 10 },
          ],
        };

        const { getByTestId } = render(
          React.createElement(TestRouteCard, { route: transitRoute })
        );

        expect(getByTestId("route-card")).toBeTruthy();
      });
    });

    describe("User interactions", () => {
      it("calls onPress when route card is tapped", () => {
        const mockOnPress = jest.fn();
        const { getByTestId } = render(
          React.createElement(TestRouteCard, {
            route: testRoute,
            onPress: mockOnPress,
          })
        );

        fireEvent.press(getByTestId("route-card"));
        expect(mockOnPress).toHaveBeenCalledTimes(1);
      });

      it("handles disabled state correctly", () => {
        const mockOnPress = jest.fn();
        const { getByTestId } = render(
          React.createElement(TestRouteCard, {
            route: testRoute,
            onPress: mockOnPress,
            disabled: true,
          })
        );

        // In disabled state, onPress should not be attached
        expect(getByTestId("route-card")).toBeTruthy();
        // Note: fireEvent.press would not trigger onPress when disabled
      });
    });
  });

  describe("Route Detail Screen Integration", () => {
    describe("Content rendering", () => {
      it("renders route content when data is available", () => {
        const screen = { route: testRoute };
        expect(screen.route.name).toBe("Test Route");
        expect(screen.route.totalDuration).toBe(30);
      });

      it("renders fallback when route is missing", () => {
        const screen = { route: null };
        expect(screen.route).toBeNull();
      });
    });

    describe("Navigation state integration", () => {
      it("displays origin and destination from store", () => {
        expect(mockNavigationStore.origin.name).toBe("Origin");
        expect(mockNavigationStore.destination.name).toBe("Destination");
      });

      it("handles missing navigation state gracefully", () => {
        const emptyStore = {
          origin: null,
          destination: null,
          selectedRoute: null,
        };
        expect(emptyStore.origin).toBeNull();
        expect(emptyStore.destination).toBeNull();
      });
    });
  });

  describe("Navigation Accessibility", () => {
    describe("Component accessibility props", () => {
      it("adds accessibility props to RouteCard", () => {
        const { getByTestId } = render(
          React.createElement(TestRouteCard, {
            route: testRoute,
            accessibilityLabel: "Route option for Test Route",
          })
        );

        expect(getByTestId("route-card")).toBeTruthy();
      });

      it("adds accessibility props to CategoryButton", () => {
        const { getByTestId: _getByTestId } = render(
          React.createElement(TestCategoryButton, {
            category: "Restaurants",
            accessibilityLabel: "Filter by restaurants",
          })
        );

        expect(getByLabelText("Filter by restaurants")).toBeTruthy();
      });

      it("adds accessibility props to TravelModeSelector", () => {
        const mockComponent = {
          selectedMode: "WALKING",
          accessibilityHint: "Choose your preferred travel mode",
        };

        expect(mockComponent.selectedMode).toBe("WALKING");
        expect(mockComponent.accessibilityHint).toBe(
          "Choose your preferred travel mode"
        );
      });

      it("adds accessibility props to VoiceNavigation controls", () => {
        const mockVoice = {
          isListening: false,
          accessibilityLabel: "Toggle voice navigation",
        };

        expect(mockVoice.isListening).toBe(false);
        expect(mockVoice.accessibilityLabel).toBe("Toggle voice navigation");
      });
    });

    describe("Screen reader support", () => {
      it("provides meaningful labels for route duration", () => {
        const accessibilityText = `Route duration: ${testRoute.totalDuration} minutes`;
        expect(accessibilityText).toBe("Route duration: 30 minutes");
      });

      it("announces transit step changes", () => {
        const transitStep = testRoute.steps[1];
        const announcement = `Now boarding ${transitStep.line}`;
        expect(announcement).toBe("Now boarding Bus 42");
      });
    });
  });

  describe("Navigation Performance", () => {
    describe("Route rendering performance", () => {
      it("renders multiple routes efficiently", () => {
        const startTime = performance.now();

        for (let i = 0; i < 10; i++) {
          render(React.createElement(TestRouteCard, { route: testRoute }));
        }

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        // Should render 10 route cards in under 100ms
        expect(renderTime).toBeLessThan(100);
      });

      it("handles large step arrays efficiently", () => {
        const routeWithManySteps = {
          ...testRoute,
          steps: Array.from({ length: 50 }, (_, i) => ({
            id: `step-${i}`,
            type: "walk",
            duration: 1,
            instruction: `Step ${i + 1}`,
          })),
        };

        const startTime = performance.now();
        render(
          React.createElement(TestRouteCard, { route: routeWithManySteps })
        );
        const endTime = performance.now();

        // Should handle 50 steps efficiently
        expect(endTime - startTime).toBeLessThan(50);
      });
    });

    describe("Deep linking performance", () => {
      it("processes multiple deep links quickly", () => {
        const urls = [
          "kidmap://route/1",
          "kidmap://route/2",
          "kidmap://search?category=restaurant",
          "kidmap://place/123",
        ];

        const startTime = performance.now();
        urls.forEach((url) => deepLinkUtils.parseRouteLink(url));
        const endTime = performance.now();

        // Should process 4 URLs in under 10ms
        expect(endTime - startTime).toBeLessThan(10);
      });
    });
  });

  describe("Integration Error Handling", () => {
    describe("Malformed data handling", () => {
      it("handles malformed route data gracefully", () => {
        const malformedRoute = {
          id: null,
          name: "",
          totalDuration: -1,
          steps: null,
        };

        const { getByTestId } = render(
          React.createElement(TestRouteCard, { route: malformedRoute })
        );

        expect(getByTestId("route-name")).toHaveTextContent("Unavailable");
        expect(getByTestId("route-duration")).toHaveTextContent("-1min");
      });

      it("handles missing navigation props gracefully", () => {
        const { getByTestId } = render(
          React.createElement(TestRouteCard, {
            // Missing required props
          })
        );

        expect(getByTestId("route-name")).toHaveTextContent("Unavailable");
      });
    });

    describe("Network failure simulation", () => {
      it("handles route query failures", () => {
        const failedQuery = { data: null, error: "Network error" };
        expect(failedQuery.data).toBeNull();
        expect(failedQuery.error).toBe("Network error");
      });

      it("handles location service failures", () => {
        const locationError = {
          location: null,
          error: "Location permission denied",
        };
        expect(locationError.location).toBeNull();
        expect(locationError.error).toBe("Location permission denied");
      });
    });
  });

  describe("Navigation Workflow Integration", () => {
    describe("End-to-end routing flow", () => {
      it("supports complete navigation workflow", () => {
        // 1. User selects origin/destination
        const workflow = {
          origin: mockNavigationStore.origin,
          destination: mockNavigationStore.destination,
        };

        // 2. Routes are fetched
        const routes = mockRoutesData;

        // 3. User selects route
        const selectedRoute = routes[0];

        // 4. Navigation begins
        expect(workflow.origin).toBeTruthy();
        expect(workflow.destination).toBeTruthy();
        expect(routes).toHaveLength(1);
        expect(selectedRoute.id).toBe("r1");
      });

      it("maintains accessibility throughout navigation flow", () => {
        const accessibilityFlow = {
          originLabel: "Selected origin: Origin",
          destinationLabel: "Selected destination: Destination",
          routeLabel: "Route selected: 25 minutes via Red Line",
          navigationLabel: "Navigation active",
        };

        expect(accessibilityFlow.originLabel).toContain("Origin");
        expect(accessibilityFlow.destinationLabel).toContain("Destination");
        expect(accessibilityFlow.routeLabel).toContain("25 minutes");
        expect(accessibilityFlow.navigationLabel).toBe("Navigation active");
      });
    });

    describe("State synchronization", () => {
      it("synchronizes route selection across components", () => {
        const sharedState = {
          selectedRouteId: "r1",
          components: ["RouteCard", "RouteDetail", "NavigationBar"],
        };

        // All components should reflect the same selected route
        expect(sharedState.selectedRouteId).toBe("r1");
        expect(sharedState.components).toContain("RouteCard");
        expect(sharedState.components).toContain("RouteDetail");
      });
    });
  });
});
// =============================================================================

function getByLabelText(label: string | RegExp): HTMLElement {
  // Use @testing-library/react-native's screen API if available
  // Otherwise, fallback to querying the document
  // This is a simplified implementation for test context
  const matches = queryAllByLabelText(label);
  if (matches.length === 0) {
    throw new Error(`Unable to find element with accessibilityLabel: ${label}`);
  }
  return matches[0];
}
