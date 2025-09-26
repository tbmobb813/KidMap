import { ThemeProvider } from "@/constants/theme";
/**
 * AIJourneyCompanion Component Tests
 *
 * ComponentTestTemplate test suite for AIJourneyCompanion AI assistant component.
 * Tests AI interaction, voice controls, suggestion generation, and theme integration.
 */

import { jest } from "@jest/globals";
import { fireEvent, render, waitFor, act } from "@testing-library/react-native";
import { Animated } from "react-native";
// Global timer and animation mocks to prevent premature unmounts and async hangs



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
jest.mock("@/hooks/useTheme", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    colors: {
      primary: "#007AFF",
      background: "#FFFFFF",
      text: "#222222",
    },
  })),
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


  describe("AIJourneyCompanion", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Default fetch mock to avoid missing mocks
      mockFetch.mockImplementation(() => Promise.resolve({ json: () => Promise.resolve({ completion: "Default content" }) } as Response));
    });

// Enable Jest fake timers for all tests in this file
beforeAll(() => {
  jest.useFakeTimers();
});
afterAll(() => {
  jest.useRealTimers();
});

    // Removed afterEach jest.useRealTimers to keep fake timers active

    describe("Basic Rendering", () => {
      it("renders without crashing", () => {
        expect(() =>
          render(<ThemeProvider><AIJourneyCompanion {...defaultProps} /></ThemeProvider>)
        ).not.toThrow();
      });

      it("does not render when not navigating", () => {
  const { queryByText } = render(<ThemeProvider><AIJourneyCompanion {...defaultProps} /></ThemeProvider>);
        expect(queryByText("Buddy")).toBeNull();
      });

      it("does not render when no destination", () => {
        const { queryByText } = render(
          <ThemeProvider>
            <AIJourneyCompanion
              currentLocation={defaultProps.currentLocation}
              destination={undefined}
              isNavigating={true}
            />
          </ThemeProvider>
        );
        expect(queryByText("Buddy")).toBeNull();
      });

      it("renders when navigating with destination", async () => {
        console.log("[TEST] Start: renders when navigating with destination");
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: "Welcome to your journey!" }),
        } as Response);
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: "Welcome again!" }),
        } as Response);

        let renderResult: ReturnType<typeof render>;
        await act(async () => {
          console.log("[TEST] Before render (act)");
          renderResult = render(
            <ThemeProvider>
              <AIJourneyCompanion {...defaultProps} isNavigating={true} />
            </ThemeProvider>
          );
          console.log("[TEST] After render (act)");
        });

        await waitFor(() => {
          expect(renderResult.getByText("Buddy")).toBeTruthy();
        }, { timeout: 2000 });
        console.log("[TEST] End: renders when navigating with destination");
      }, 20000);
    });

    describe("AI Content Generation", () => {
      it("makes API call when starting navigation", async () => {
        console.log("[TEST] Start: makes API call when starting navigation");
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: "Test content" }),
        } as Response);

  let renderResult: ReturnType<typeof render>;
        await act(async () => {
          console.log("[TEST] Before render (act)");
          renderResult = render(<ThemeProvider><AIJourneyCompanion {...defaultProps} isNavigating={true} /></ThemeProvider>);
          console.log("[TEST] After render (act)");
          jest.advanceTimersByTime(100);
          jest.runAllTimers();
          await Promise.resolve();
          console.log("[TEST] After timers and Promise.resolve (act)");
        });

        await waitFor(
          () => {
            console.log("[TEST] Inside waitFor callback");
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
        console.log("[TEST] End: makes API call when starting navigation");
      }, 20000);

      it("displays AI generated content", async () => {
        const aiResponse = "Libraries are amazing places!";
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: aiResponse }),
        } as Response);

  let renderResult: ReturnType<typeof render>;
        await act(async () => {
          renderResult = render(
            <ThemeProvider>
              <AIJourneyCompanion {...defaultProps} isNavigating={true} />
            </ThemeProvider>
          );
          jest.advanceTimersByTime(100);
          jest.runAllTimers();
          await Promise.resolve();
        });

        await waitFor(
          () => {
            expect(renderResult.getByText(aiResponse)).toBeTruthy();
          },
          { timeout: 2000 }
        );
  }, 20000);

      it("handles API failures gracefully", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network error"));

  let renderResult: ReturnType<typeof render>;
        await act(async () => {
          renderResult = render(
            <ThemeProvider>
              <AIJourneyCompanion {...defaultProps} isNavigating={true} />
            </ThemeProvider>
          );
          jest.advanceTimersByTime(100);
          jest.runAllTimers();
          await Promise.resolve();
        });

        await waitFor(
          () => {
            expect(
              renderResult.getByText(/Great choice going to Central Library/)
            ).toBeTruthy();
          },
          { timeout: 2000 }
        );
  }, 20000);
    });

    describe("Interactive Features", () => {
      it("expands to show action buttons when tapped", async () => {
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: "Test content" }),
        } as Response);
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: "Expanded content" }),
        } as Response);

        let renderResult: ReturnType<typeof render> | undefined;
        await act(async () => {
          renderResult = render(
            <ThemeProvider>
              <AIJourneyCompanion {...defaultProps} isNavigating={true} />
            </ThemeProvider>
          );
        });

        await waitFor(() => {
          expect(renderResult!.getByText("Buddy")).toBeTruthy();
        }, { timeout: 2000 });

        fireEvent.press(renderResult!.getByText("Buddy"));

        await waitFor(() => {
          expect(renderResult!.getByText("Quiz Me!")).toBeTruthy();
          expect(renderResult!.getByText("Tell Me More")).toBeTruthy();
        }, { timeout: 2000 });
      }, 20000);

      it("generates quiz content when Quiz Me pressed", async () => {
        // Initial content
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: "Initial content" }),
        } as Response);

        const { getByText } = render(
          <ThemeProvider>
            <AIJourneyCompanion {...defaultProps} isNavigating={true} />
          </ThemeProvider>
        );

        await act(async () => {
          jest.advanceTimersByTime(100);
          jest.runAllTimers();
          await Promise.resolve();
        });
        await waitFor(() => expect(getByText("Buddy")).toBeTruthy(), {
          timeout: 2000,
        });

        await act(async () => {
          fireEvent.press(getByText("Buddy"));
        });

        // Quiz content (mock fetch again for button press)
        mockFetch.mockResolvedValueOnce({
          json: () =>
            Promise.resolve({ completion: "What makes libraries special?" }),
        } as Response);

        await act(async () => {
          fireEvent.press(getByText("Quiz Me!"));
          jest.advanceTimersByTime(100);
          jest.runAllTimers();
          await Promise.resolve();
        });

        await waitFor(
          () => {
            expect(
              getByText("🧠 Quiz Time! What makes libraries special?")
            ).toBeTruthy();
          },
          { timeout: 2000 }
        );
      }, 20000);
    });

    describe("Error Handling", () => {
      it("handles missing destination gracefully", () => {
        const { queryByText } = render(
          <ThemeProvider>
            <AIJourneyCompanion
              currentLocation={defaultProps.currentLocation}
              destination={undefined}
              isNavigating={true}
            />
          </ThemeProvider>
        );
        expect(queryByText("Buddy")).toBeNull();
      });

      it("handles malformed API responses", async () => {
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ invalid: "response" }),
        } as Response);

        const { getByText } = render(
          <ThemeProvider>
            <AIJourneyCompanion {...defaultProps} isNavigating={true} />
          </ThemeProvider>
        );

  jest.advanceTimersByTime(100);
  jest.runAllTimers();
  await Promise.resolve();

        await waitFor(
          () => {
            expect(getByText(/Great choice going to/)).toBeTruthy();
          },
          { timeout: 2000 }
        );
  }, 20000);

      it("handles rapid interactions without crashing", async () => {
        // Initial fetch for render
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: "Test content" }),
        } as Response);

        const { getByText } = render(
          <ThemeProvider>
            <AIJourneyCompanion {...defaultProps} isNavigating={true} />
          </ThemeProvider>
        );

        jest.advanceTimersByTime(100);
        jest.runAllTimers();
        await Promise.resolve();
        await waitFor(() => expect(getByText("Buddy")).toBeTruthy(), {
          timeout: 2000,
        });

        // Each press should have a fetch mock
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: "Test content" }),
        } as Response);
        fireEvent.press(getByText("Buddy"));
        jest.advanceTimersByTime(100);
        jest.runAllTimers();
        await Promise.resolve();

        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: "Test content" }),
        } as Response);
        fireEvent.press(getByText("Buddy"));
        jest.advanceTimersByTime(100);
        jest.runAllTimers();
        await Promise.resolve();

        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: "Test content" }),
        } as Response);
        fireEvent.press(getByText("Buddy"));
        jest.advanceTimersByTime(100);
        jest.runAllTimers();
        await Promise.resolve();

        expect(getByText("Buddy")).toBeTruthy();
      }, 20000);
    });

    describe("Accessibility", () => {
      it("provides accessible button for main companion", async () => {
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: "Test content" }),
        } as Response);

        const { getByText } = render(
          <ThemeProvider>
            <AIJourneyCompanion {...defaultProps} isNavigating={true} />
          </ThemeProvider>
        );

  jest.advanceTimersByTime(100);
  jest.runAllTimers();
  await Promise.resolve();

        await waitFor(
          () => {
            const buddyButton = getByText("Buddy").parent;
            expect(buddyButton.type).toBe("Pressable");
          },
          { timeout: 2000 }
        );
  }, 20000);
    });

    describe("Theme Integration", () => {
      it("applies theme colors correctly", async () => {
        mockFetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ completion: "Theme test" }),
        } as Response);

        const { getByText } = render(
          <ThemeProvider>
            <AIJourneyCompanion {...defaultProps} isNavigating={true} />
          </ThemeProvider>
        );

  jest.advanceTimersByTime(100);
  jest.runAllTimers();
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
  }, 20000);
    });

    describe("Animation Lifecycle", () => {
      it("initializes animations when navigating", () => {
        render(
          <ThemeProvider>
            <AIJourneyCompanion
              currentLocation={{ latitude: 40.7128, longitude: -74.006 }}
              destination={mockPlace}
              isNavigating={true}
            />
          </ThemeProvider>
        );

        // Verify animation setup was called
        expect(Animated.Value).toHaveBeenCalled();
      });

      it("handles animation lifecycle", () => {
        const { unmount } = render(
          <ThemeProvider>
            <AIJourneyCompanion
              currentLocation={{ latitude: 40.7128, longitude: -74.006 }}
              destination={mockPlace}
              isNavigating={true}
            />
          </ThemeProvider>
        );

        // Should not throw when unmounting
        expect(() => unmount()).not.toThrow();
      });

      it("handles location updates", () => {
        const newLocation = { latitude: 40.714, longitude: -74.007 };

        expect(() =>
          render(
            <ThemeProvider>
              <AIJourneyCompanion
                currentLocation={newLocation}
                destination={mockPlace}
                isNavigating={true}
              />
            </ThemeProvider>
          )
        ).not.toThrow();
      });
    });
  });
});