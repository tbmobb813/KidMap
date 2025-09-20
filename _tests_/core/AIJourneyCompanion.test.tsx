/**
 * AIJourneyCompanion Component Tests
 *
 * ComponentTestTemplate test suite for AIJourneyCompanion AI assistant component.
 * Tests AI interaction, voice controls, suggestion generation, and theme integration.
 */

import { jest } from "@jest/globals";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Animated } from "react-native";


import AIJourneyCompanion from "@/components/AIJourneyCompanion";
import { Place } from "@/types/navigation";

const mockTrack = jest.fn();

// Mock dependencies
jest.mock("lucide-react-native", () => ({
  Bot: ({ size, color }: any) => `MockBot-${size}-${color}`,
  Volume2: ({ size, color }: any) => `MockVolume2-${size}-${color}`,
  VolumeX: ({ size, color }: any) => `MockVolumeX-${size}-${color}`,
  Sparkles: ({ size, color }: any) => `MockSparkles-${size}-${color}`,
}));

// Mock telemetry
jest.mock("@/telemetry", () => ({
  track: (...args: any[]) => mockTrack(...args),
}));

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

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

describe("AIJourneyCompanion", () => {

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

  jest.mock("@/hooks/useTheme", () => ({
    __esModule: true,
    default: jest.fn(),
  }));
  const mockUseTheme = require("@/hooks/useTheme").default;

  const mockTheme = {
    colors: {
      primary: "#007AFF",
      background: "#FFFFFF",
      text: "#222222",
    },
  };

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
      }, 5000);
    });

    describe("AI Content Generation", () => {
      it("makes API call when starting navigation", async () => {
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: "Test content" }),
        } as Response);

        render(<AIJourneyCompanion {...defaultProps} isNavigating={true} />);

        jest.advanceTimersByTime(100);

        await waitFor(
          () => {
            expect(mockFetch).toHaveBeenCalledWith(
              "https://toolkit.rork.com/text/llm/",
              expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
              })
            );
          },
          { timeout: 2000 }
        );
      }, 5000);

      it("displays AI generated content", async () => {
        const aiResponse = "Libraries are amazing places!";
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: aiResponse }),
        } as Response);

        const { getByText } = render(
          <AIJourneyCompanion {...defaultProps} isNavigating={true} />
        );

        jest.advanceTimersByTime(100);

        await waitFor(
          () => {
            expect(getByText(aiResponse)).toBeTruthy();
          },
          { timeout: 2000 }
        );
      }, 5000);

      it("handles API failures gracefully", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network error"));

        const { getByText } = render(
          <AIJourneyCompanion {...defaultProps} isNavigating={true} />
        );

        jest.advanceTimersByTime(100);

        await waitFor(
          () => {
            expect(
              getByText(/Great choice going to Central Library/)
            ).toBeTruthy();
          },
          { timeout: 2000 }
        );
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

        jest.advanceTimersByTime(100);

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

        const { getByText } = render(
          <AIJourneyCompanion {...defaultProps} isNavigating={true} />
        );

        jest.advanceTimersByTime(100);
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

        jest.advanceTimersByTime(100);

        await waitFor(
          () => {
            expect(
              getByText("🧠 Quiz Time! What makes libraries special?")
            ).toBeTruthy();
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

        jest.advanceTimersByTime(100);

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

        jest.advanceTimersByTime(100);
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

        jest.advanceTimersByTime(100);

        await waitFor(
          () => {
            const buddyButton = getByText("Buddy").parent;
            expect(buddyButton.type).toBe("Pressable");
          },
          { timeout: 2000 }
        );
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

        jest.advanceTimersByTime(100);

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

    describe("Animation Lifecycle", () => {
      it("initializes animations when navigating", () => {
        render(
          <AIJourneyCompanion
            currentLocation={{ latitude: 40.7128, longitude: -74.006 }}
            destination={mockPlace}
            isNavigating={true}
          />
        );

        // Verify animation setup was called
        expect(Animated.Value).toHaveBeenCalled();
      });

      it("handles animation lifecycle", () => {
        const { unmount } = render(
          <AIJourneyCompanion
            currentLocation={{ latitude: 40.7128, longitude: -74.006 }}
            destination={mockPlace}
            isNavigating={true}
          />
        );

        // Should not throw when unmounting
        expect(() => unmount()).not.toThrow();
      });

      it("handles location updates", () => {
        const newLocation = { latitude: 40.714, longitude: -74.007 };

        expect(() =>
          render(
            <AIJourneyCompanion
              currentLocation={newLocation}
              destination={mockPlace}
              isNavigating={true}
            />
          )
        ).not.toThrow();
      });
    });
  });
});