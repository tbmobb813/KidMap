import { jest } from "@jest/globals";
import { render, waitFor } from "@testing-library/react-native";
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
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

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

// Mock Animated with immediate completion
const mockAnimatedValue = {
  setValue: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
};

const mockAnimation = {
  start: jest.fn((callback?: (result: { finished: boolean }) => void) => {
    if (callback) {
      setTimeout(() => callback({ finished: true }), 10);
    }
  }),
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
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
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

    it("renders when navigating with destination", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ completion: "Welcome to your journey!" }),
      } as Response);

      const { getByText } = render(
        <AIJourneyCompanion {...defaultProps} isNavigating={true} />
      );

      // Fast forward timers to complete async operations
      jest.advanceTimersByTime(100);

      await waitFor(
        () => {
          expect(getByText("Buddy")).toBeTruthy();
        },
        { timeout: 2000 }
      );
    });
  });
});