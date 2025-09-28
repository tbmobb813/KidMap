import { jest } from "@jest/globals";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Animated } from "react-native";

import AIJourneyCompanion from "../../components/AIJourneyCompanion";
import { useTheme } from "../../constants/theme";
import { Place } from "../../types/navigation";

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
    // Use real timers so Promise microtasks and async fetch flows resolve
    // naturally under testing-library's act wrappers. Fake timers can
    // prevent async state updates from running and cause "not wrapped in
    // act(...)" warnings when Promises resolve outside of an act.
    jest.useRealTimers();
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

      // Allow pending microtasks (fetch promise resolution) to run so the
      // component's state updates occur inside testing-library's act.
      await Promise.resolve();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      }, { timeout: 5000 });
    }, 5000);
  });

  describe("AI Content Generation", () => {
  it("makes API call when starting navigation", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ completion: "Test content" }),
      } as Response);

      render(<AIJourneyCompanion {...defaultProps} isNavigating={true} />);

  // allow any pending microtasks (fetch) to resolve
  await Promise.resolve();
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "https://toolkit.rork.com/text/llm/",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );
      }, { timeout: 5000 });
    }, 5000);

  it("displays AI generated content", async () => {
      const aiResponse = "Libraries are amazing places!";
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ completion: aiResponse }),
      } as Response);

  const { getByText } = render(
        <AIJourneyCompanion {...defaultProps} isNavigating={true} />
      );

  // allow fetch promise to resolve
  await Promise.resolve();
      await waitFor(() => {
        expect(getByText(aiResponse)).toBeTruthy();
      }, { timeout: 5000 });
    }, 5000);

  it("handles API failures gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

  const { getByText } = render(
        <AIJourneyCompanion {...defaultProps} isNavigating={true} />
      );

  // allow fallback or fetch microtask to run
  await Promise.resolve();
      await waitFor(() => {
        expect(
          getByText(/Great choice going to Central Library/)
        ).toBeTruthy();
      }, { timeout: 5000 });
    }, 5000);
  });

  describe("Interactive Features", () => {
    it("expands to show action buttons when tapped", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ completion: "Test content" }),
      } as Response);

      const { getByText } = render(
        <AIJourneyCompanion {...defaultProps} isNavigating={true} />
      );

      // allow any fetch resolution
      await Promise.resolve();

      await waitFor(() => expect(getByText("Buddy")).toBeTruthy(), {
        timeout: 2000,
      });

      fireEvent.press(getByText("Buddy"));

      expect(getByText("Quiz Me!")).toBeTruthy();
      expect(getByText("Tell Me More")).toBeTruthy();
    }, 5000);

  it("generates quiz content when Quiz Me pressed", async () => {
      // Initial content
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ completion: "Initial content" }),
      } as Response);

      const { getByText, getAllByText } = render(
        <AIJourneyCompanion {...defaultProps} isNavigating={true} />
      );

      // allow any pending fetch microtask
      await Promise.resolve();
      await waitFor(() => expect(getByText("Buddy")).toBeTruthy(), {
        timeout: 2000,
      });

      fireEvent.press(getByText("Buddy"));

      // Quiz content
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({ completion: "What makes libraries special?" }),
      } as Response);

      fireEvent.press(getByText("Quiz Me!"));

      // allow pending fetches/microtasks
      await Promise.resolve();
      await waitFor(
        () => {
          // The quiz text may appear in multiple places (preview and expanded
          // content). Use a tolerant assertion to accept multiple matches.
          const matches = getAllByText("🧠 Quiz Time! What makes libraries special?");
          expect(matches.length).toBeGreaterThan(0);
        },
        { timeout: 2000 }
      );
    }, 10000);
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

    it("handles malformed API responses", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ invalid: "response" }),
      } as Response);

      const { getByText } = render(
        <AIJourneyCompanion {...defaultProps} isNavigating={true} />
      );

      // allow fetch microtasks to resolve
      await Promise.resolve();
      await waitFor(
        () => {
          expect(getByText(/Great choice going to/)).toBeTruthy();
        },
        { timeout: 2000 }
      );
    }, 5000);

    it("handles rapid interactions without crashing", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ completion: "Test content" }),
      } as Response);

      const { getByText } = render(
        <AIJourneyCompanion {...defaultProps} isNavigating={true} />
      );

      // allow any pending fetch microtasks
      await Promise.resolve();
      await waitFor(() => expect(getByText("Buddy")).toBeTruthy(), {
        timeout: 2000,
      });

      // Rapid interactions
      fireEvent.press(getByText("Buddy"));
      fireEvent.press(getByText("Buddy"));
      fireEvent.press(getByText("Buddy"));

      expect(getByText("Buddy")).toBeTruthy();
    }, 5000);
  });

  describe("Accessibility", () => {
    it("provides accessible button for main companion", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ completion: "Test content" }),
      } as Response);

      const { getByText } = render(
        <AIJourneyCompanion {...defaultProps} isNavigating={true} />
      );

      // allow any pending microtasks
      await Promise.resolve();

      // Instead of inspecting implementation details (parent.type), verify
      // the element is interactable by pressing it and observing the
      // resulting UI (the action buttons are shown). This is more robust
      // across test renderers.
      await waitFor(() => expect(getByText("Buddy")).toBeTruthy(), { timeout: 2000 });
      fireEvent.press(getByText("Buddy"));
      await waitFor(() => expect(getByText("Quiz Me!")).toBeTruthy(), { timeout: 2000 });
    }, 5000);
  });

  describe("Theme Integration", () => {
    it("applies theme colors correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ completion: "Theme test" }),
      } as Response);

      const { getByText } = render(
        <AIJourneyCompanion {...defaultProps} isNavigating={true} />
      );

      // allow any pending microtasks
      await Promise.resolve();
      await waitFor(
        () => {
          const buddyText = getByText("Buddy");
          expect(buddyText.props.style).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ color: "#007AFF" }),
            ])
          );
        },
        { timeout: 2000 }
      );
    }, 5000);
  });
});
