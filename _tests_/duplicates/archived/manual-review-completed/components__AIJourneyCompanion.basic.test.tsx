import { jest } from "@jest/globals";
import { render } from "@testing-library/react-native";

import AIJourneyCompanion from "@/components/AIJourneyCompanion";
import { useTheme } from "@/constants/theme";
import { Place } from "@/types/navigation";

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
  track: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

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
  });

  describe("Error Handling", () => {
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
  });
});
