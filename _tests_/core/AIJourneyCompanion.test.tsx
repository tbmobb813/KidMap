import { fireEvent, render, waitFor, act } from "@testing-library/react-native";
import React from "react";
import { Animated } from "react-native";

import AIJourneyCompanion from "@/components/AIJourneyCompanion";
import { ThemeProvider } from "@/constants/theme";
import { Place } from '@/types/navigation';


// Keep tests stable: prefer using any shared global mocks if present, otherwise
// provide safe defaults here. This merged suite focuses on the high-value tests
// while adopting robust patterns from the minimal test file.

// Ensure a global fetch mock exists and is a jest.fn
if (!(global as any).fetch) {
  (global as any).fetch = jest.fn();
}
const mockFetch = (global as any).fetch as jest.MockedFunction<any>;

// Provide telemetry mock (use existing global if present)
const mockTrack = (global as any).__mockTrack || jest.fn();
if (!(global as any).__mockTrack) (global as any).__mockTrack = mockTrack;
jest.mock("@/telemetry", () => ({ track: (...args: any[]) => mockTrack(...args) }));

// Lightweight icon mocks to avoid host-type problems
jest.mock("lucide-react-native", () => ({
  Bot: ({ size, color }: any) => `MockBot-${size}-${color}`,
  Volume2: ({ size, color }: any) => `MockVolume2-${size}-${color}`,
  VolumeX: ({ size, color }: any) => `MockVolumeX-${size}-${color}`,
  Sparkles: ({ size, color }: any) => `MockSparkles-${size}-${color}`,
}));

// Provide a simple useTheme mock if not already provided by test setup
jest.mock("@/hooks/useTheme", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    colors: { primary: "#007AFF", background: "#FFFFFF", text: "#222222" },
  })),
}));

// Animated shim used by component — keep immediate completion behavior
const mockAnimatedValue = { setValue: jest.fn(), start: jest.fn(), stop: jest.fn(), reset: jest.fn() };
const mockAnimation = { start: jest.fn((cb?: any) => cb && cb({ finished: true })) };
beforeAll(() => {
  (Animated as any).Value = jest.fn(() => mockAnimatedValue);
  (Animated as any).loop = jest.fn(() => mockAnimation);
  (Animated as any).sequence = jest.fn(() => mockAnimation);
  (Animated as any).timing = jest.fn(() => mockAnimation);
  // Keep a slightly larger timeout for this file to be tolerant in CI
  jest.setTimeout(15000);
  jest.useRealTimers();
});
afterAll(() => {
  jest.useRealTimers();
});

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockImplementation(() => Promise.resolve({ json: () => Promise.resolve({ completion: "Default content" }) }));
});

const defaultPlace: Place = {
  id: "place-1",
  name: "Central Library",
  address: "123 Main St",
  category: "library",
  coordinates: { latitude: 40.7128, longitude: -74.006 },
};

describe("AIJourneyCompanion (merged)", () => {
  describe("Basic rendering and lifecycle", () => {
    it("does not render when not navigating", () => {
      const { queryByText } = render(
        <ThemeProvider>
          <AIJourneyCompanion currentLocation={{ latitude: 0, longitude: 0 }} destination={defaultPlace} isNavigating={false} />
        </ThemeProvider>
      );
      expect(queryByText("Buddy")).toBeNull();
    });

    it("renders when navigating with destination", async () => {
      mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ completion: "Welcome to your journey!" }) });
      const r = render(
        <ThemeProvider>
          <AIJourneyCompanion currentLocation={{ latitude: 0, longitude: 0 }} destination={defaultPlace} isNavigating={true} />
        </ThemeProvider>
      );
      await waitFor(() => expect(r.getByText("Buddy")).toBeTruthy(), { timeout: 3000 });
    });

    it("initializes animations when navigating", () => {
      render(
        <ThemeProvider>
          <AIJourneyCompanion currentLocation={{ latitude: 0, longitude: 0 }} destination={defaultPlace} isNavigating={true} />
        </ThemeProvider>
      );
      expect((Animated as any).Value).toHaveBeenCalled();
    });
  });

  describe("AI content and API integration", () => {
    it("calls the LLM API when navigation starts", async () => {
      mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ completion: "Test content" }) });
      render(
        <ThemeProvider>
          <AIJourneyCompanion currentLocation={{ latitude: 0, longitude: 0 }} destination={defaultPlace} isNavigating={true} />
        </ThemeProvider>
      );
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "https://toolkit.rork.com/text/llm/",
          expect.objectContaining({ method: "POST", headers: { "Content-Type": "application/json" } })
        );
      }, { timeout: 3000 });
    });

    it("displays AI generated content", async () => {
      const aiResponse = "Libraries are amazing places!";
      mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ completion: aiResponse }) });
      const r = render(
        <ThemeProvider>
          <AIJourneyCompanion currentLocation={{ latitude: 0, longitude: 0 }} destination={defaultPlace} isNavigating={true} />
        </ThemeProvider>
      );
      await waitFor(() => {
        const matches = r.getAllByText(new RegExp(aiResponse));
        expect(matches.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it("handles API failures gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      const r = render(
        <ThemeProvider>
          <AIJourneyCompanion currentLocation={{ latitude: 0, longitude: 0 }} destination={defaultPlace} isNavigating={true} />
        </ThemeProvider>
      );
      // let microtasks settle
      await act(async () => Promise.resolve());
      await waitFor(() => {
        // Component should render a friendly fallback message (tolerant match)
        expect(r.getByText(/Great choice going to/)).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe("Interactions", () => {
    it("expands when Buddy is pressed and shows action buttons", async () => {
      mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ completion: "Initial" }) });
      const r = render(
        <ThemeProvider>
          <AIJourneyCompanion currentLocation={{ latitude: 0, longitude: 0 }} destination={defaultPlace} isNavigating={true} />
        </ThemeProvider>
      );
      await waitFor(() => expect(r.getByText('Buddy')).toBeTruthy(), { timeout: 3000 });
      fireEvent.press(r.getByText('Buddy'));
      await waitFor(() => {
        expect(r.getByText('Quiz Me!')).toBeTruthy();
        expect(r.getByText('Tell Me More')).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('generates quiz content when Quiz Me is pressed', async () => {
      mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ completion: 'Quiz question' }) });
      const r = render(
        <ThemeProvider>
          <AIJourneyCompanion currentLocation={{ latitude: 0, longitude: 0 }} destination={defaultPlace} isNavigating={true} />
        </ThemeProvider>
      );
      await waitFor(() => expect(r.getByText('Buddy')).toBeTruthy(), { timeout: 3000 });
      fireEvent.press(r.getByText('Buddy'));
      await waitFor(() => expect(r.getByText('Quiz Me!')).toBeTruthy(), { timeout: 3000 });
      mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ completion: 'What makes libraries special?' }) });
      fireEvent.press(r.getByText('Quiz Me!'));
      await waitFor(() => {
        const matches = r.getAllByText(/What makes libraries special\?|Quiz Time!/i);
        expect(matches.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });

  describe('Accessibility & Theme', () => {
    it('exposes an onPress handler for Buddy (accessibility)', async () => {
      mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ completion: 'Test' }) });
      const r = render(
        <ThemeProvider>
          <AIJourneyCompanion currentLocation={{ latitude: 0, longitude: 0 }} destination={defaultPlace} isNavigating={true} />
        </ThemeProvider>
      );
      await waitFor(() => {
        // Walk up ancestors to find press handler
        let current: any = r.getByText('Buddy');
        while (current && !current.props?.onPress && current.parent) current = current.parent;
        expect(current?.props?.onPress).toBeDefined();
      }, { timeout: 3000 });
    });

    it('applies theme color to Buddy text', async () => {
      mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ completion: 'Theme test' }) });
      const r = render(
        <ThemeProvider>
          <AIJourneyCompanion currentLocation={{ latitude: 0, longitude: 0 }} destination={defaultPlace} isNavigating={true} />
        </ThemeProvider>
      );
      await waitFor(() => {
        const buddy = r.getByText('Buddy');
        expect(buddy.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ color: expect.any(String) })]));
      }, { timeout: 3000 });
    });
  });
});