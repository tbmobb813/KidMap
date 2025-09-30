// Archived: merged into `_tests_/core/AIJourneyCompanion.test.tsx`
// Original moved here on 2025-09-09 by automated dedupe assistant.
// File preserved for reference; delete after human review if no longer needed.

import { render } from "@testing-library/react-native";
import { Animated } from "react-native";

import AIJourneyCompanion from "@/components/AIJourneyCompanion";
import { useTheme } from "@/constants/theme";
import { Place } from "@/types/navigation";

const mockTrack = jest.fn();

// Mock dependencies
jest.mock("@/constants/theme");
jest.mock("lucide-react-native", () => ({
  Bot: () => "Bot",
  Volume2: () => "Volume2",
  VolumeX: () => "VolumeX",
  Sparkles: () => "Sparkles",
}));

// Mock telemetry
jest.mock("@/telemetry", () => ({
  track: (...args: any[]) => mockTrack(...args),
}));

// Mock fetch globally - make it resolve immediately
global.fetch = jest.fn(
  async (_input: RequestInfo | URL, _init?: RequestInit) =>
    ({
      json: async () => ({ completion: "Test content" }),
      ok: true,
      status: 200,
      headers: {
        get: () => null,
      },
      // Add other Response properties/methods as needed for your tests
    } as unknown as Response)
);

const mockTheme = {
  name: "light" as const,
  colors: {
    surface: "#ffffff",
    text: "#000000",
    primary: "#007AFF",
    primaryForeground: "#ffffff",
    textSecondary: "#666666",
    border: "#e0e0e0",
    surfaceAlt: "#f5f5f5",
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 4, md: 8, lg: 16 },
  elevation: { sm: 2, md: 4, lg: 8 },
};

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

const mockPlace: Place = {
  id: "place-1",
  name: "Central Library",
  address: "123 Main St, Downtown",
  category: "library" as const,
  coordinates: { latitude: 40.7128, longitude: -74.006 },
  isFavorite: false,
};

const defaultProps = {
  currentLocation: { latitude: 40.7128, longitude: -74.006 },
  destination: mockPlace,
  isNavigating: false,
};

// Mock Animated - all operations complete immediately
const mockAnimatedValue = {
  setValue: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
};

const mockAnimation = {
  start: jest.fn(),
};

beforeAll(() => {
  (Animated as any).Value = jest.fn(() => mockAnimatedValue);
  (Animated as any).loop = jest.fn(() => mockAnimation);
  (Animated as any).sequence = jest.fn(() => mockAnimation);
  (Animated as any).timing = jest.fn(() => mockAnimation);
});

describe("AIJourneyCompanion", () => {
  beforeEach(() => {
    mockUseTheme.mockReturnValue(mockTheme as any);
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      expect(() =>
        render(<AIJourneyCompanion {...defaultProps} />)
      ).not.toThrow();
    });

    it("does not render when not navigating", () => {
      const { queryByText } = render(<AIJourneyCompanion {...defaultProps} />);
      expect(queryByText("Buddy")).toBeNull();
    });

    it("does not render when no destination", () => {
      const { queryByText } = render(
        <AIJourneyCompanion
          currentLocation={defaultProps.currentLocation}
          destination={undefined}
          isNavigating={true}
        />
      );
      expect(queryByText("Buddy")).toBeNull();
    });

    it("renders basic structure when navigating", () => {
      expect(() =>
        render(<AIJourneyCompanion {...defaultProps} isNavigating={true} />)
      ).not.toThrow();
    });
  });

  describe("Props Handling", () => {
    it("handles missing destination gracefully", () => {
      const { queryByText } = render(
        <AIJourneyCompanion
          currentLocation={defaultProps.currentLocation}
          destination={undefined}
          isNavigating={true}
        />
      );
      expect(queryByText("Buddy")).toBeNull();
    });

    it("handles different place categories", () => {
      const museumPlace: Place = {
        ...mockPlace,
        category: "museum" as any,
        name: "Science Museum",
      };

      expect(() =>
        render(
          <AIJourneyCompanion
            {...defaultProps}
            destination={museumPlace}
            isNavigating={true}
          />
        )
      ).not.toThrow();
    });

    it("handles location updates", () => {
      const newLocation = { latitude: 40.714, longitude: -74.007 };

      expect(() =>
        render(
          <AIJourneyCompanion
            {...defaultProps}
            currentLocation={newLocation}
            isNavigating={true}
          />
        )
      ).not.toThrow();
    });
  });

  describe("Animation Setup", () => {
    it("initializes animations when navigating", () => {
      render(<AIJourneyCompanion {...defaultProps} isNavigating={true} />);

      // Verify animation setup was called
      expect(Animated.Value).toHaveBeenCalled();
    });

    it("handles animation lifecycle", () => {
      const { unmount } = render(
        <AIJourneyCompanion {...defaultProps} isNavigating={true} />
      );

      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Theme Integration", () => {
    it("uses theme values from context", () => {
      render(<AIJourneyCompanion {...defaultProps} isNavigating={true} />);

      // Verify theme hook was called
      expect(mockUseTheme).toHaveBeenCalled();
    });

    it("handles theme changes", () => {
      const darkTheme = {
        ...mockTheme,
        name: "dark" as const,
        colors: { ...mockTheme.colors, surface: "#000000", text: "#ffffff" },
      };

      mockUseTheme.mockReturnValueOnce(darkTheme as any);

      expect(() =>
        render(<AIJourneyCompanion {...defaultProps} isNavigating={true} />)
      ).not.toThrow();
    });
  });

  describe("Error Boundaries", () => {
    it("handles component errors gracefully", () => {
      // Test with invalid props
      expect(() =>
        render(
          <AIJourneyCompanion
            currentLocation={null as any}
            destination={mockPlace}
            isNavigating={true}
          />
        )
      ).not.toThrow();
    });

    it("handles theme errors gracefully", () => {
      mockUseTheme.mockReturnValueOnce(null as any);

      expect(() =>
        render(<AIJourneyCompanion {...defaultProps} isNavigating={true} />)
      ).not.toThrow();
    });
  });
});
