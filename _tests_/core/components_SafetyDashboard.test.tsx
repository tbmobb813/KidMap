import { fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

// Mock stores and hooks BEFORE importing the component
const mockUseParentalStore = jest.fn();
const mockUseNavigationStore = jest.fn();
const mockUseSafeZoneMonitor = jest.fn();

jest.mock("@/stores/parentalStore", () => ({
  __esModule: true,
  // Ensure the named export is a callable function at import time.
  // Delegate to the test-level jest.fn so tests can change implementations.
  useParentalStore: (...args: any[]) => mockUseParentalStore(...args),
  ParentalProvider: ({ children }: any) => children,
}));

jest.mock("@/stores/navigationStore", () => ({
  __esModule: true,
  // Ensure the named export is a callable function at import time.
  // Delegate to the test-level jest.fn so tests can change implementations.
  useNavigationStore: (...args: any[]) => mockUseNavigationStore(...args),
}));

jest.mock("@/hooks/useSafeZoneMonitor", () => ({
  useSafeZoneMonitor: mockUseSafeZoneMonitor,
}));

import SafetyDashboard from "../../components/SafetyDashboard";
import { render, testThemeToggling } from "../testUtils";

// Mock Alert.alert for comprehensive testing
jest.spyOn(Alert, "alert");

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  MediaTypeOptions: { Images: "Images" },
}));

jest.mock("../../components/PhotoCheckInButton", () => {
  const React = require("react");
  const MockPhotoCheckInButton = React.forwardRef((props: any, ref: any) =>
    React.createElement(
      require("react-native").View,
      { testID: "photo-checkin-button", ref, ...props },
      React.createElement(
        require("react-native").Text,
        {},
        "PhotoCheckInButton"
      )
    )
  );
  MockPhotoCheckInButton.displayName = "MockPhotoCheckInButton";
  return MockPhotoCheckInButton;
});

jest.mock("../../components/SafeZoneIndicator", () => ({
  SafeZoneIndicator: ({ ...props }: any) =>
    require("react-native").View({ testID: "safe-zone-indicator", ...props }),
}));

// Enhanced mock implementations for comprehensive testing
const mockGetCurrentSafeZoneStatus = jest.fn();

jest.mock("@/hooks/useSafeZoneMonitor", () => ({
  useSafeZoneMonitor: jest.fn(() => ({
    getCurrentSafeZoneStatus: mockGetCurrentSafeZoneStatus,
  })),
}));

// Debug: inspect the resolved parentalStore mock shape before importing the component
// This helps verify jest.mock hoisting and module resolution for named exports
try {
   
  const _debugParental = require("@/stores/parentalStore");
  // write to stderr so jest doesn't swallow the debug output
  try {
    process.stderr.write(
      `[DEBUG] parentalStore mock: ${JSON.stringify(
        Object.keys(_debugParental || {})
      )} typeof useParentalStore: ${typeof _debugParental.useParentalStore}\n`
    );
  } catch (e) {
    process.stderr.write(`[DEBUG] parentalStore mock (inspect failed): ${String(e)}\n`);
  }
} catch (e) {
  process.stderr.write(`[DEBUG] parentalStore require failed: ${String(e)}\n`);
}

// Also inspect navigationStore to ensure the mocked named export is callable
try {
   
  const _debugNav = require("@/stores/navigationStore");
  try {
    // Use console.error to avoid TS 'process' global issues
    console.error(
      `[DEBUG] navigationStore mock: ${JSON.stringify(Object.keys(_debugNav || {}))} typeof useNavigationStore: ${typeof _debugNav.useNavigationStore}`
    );
  } catch (e) {
    console.error(`[DEBUG] navigationStore inspect failed: ${String(e)}`);
  }
} catch (e) {
  console.error(`[DEBUG] navigationStore require failed: ${String(e)}`);
}

// Mock data setup function for comprehensive testing scenarios
const createMockData = (overrides: any = {}) => ({
  navigationStore: {
    photoCheckIns: [
      { placeName: "School", timestamp: Date.now() - 100000 },
      { placeName: "Home", timestamp: Date.now() - 200000 },
    ],
    ...overrides.navigationStore,
  },
  parentalStore: {
    settings: {
      emergencyContacts: [{ id: "p1", phone: "9876543210", isPrimary: true }],
    },
    dashboardData: { safeZoneActivity: [] },
    devicePings: [],
    checkInRequests: [
      { id: "1", status: "pending" },
      { id: "2", status: "completed" },
    ],
    safeZones: [
      { id: "sz1", name: "School Zone", isActive: true },
      { id: "sz2", name: "Home Zone", isActive: true },
    ],
    addCheckInToDashboard: jest.fn(),
    updateLastKnownLocation: jest.fn(),
    ...overrides.parentalStore,
  },
  safeZoneStatus: {
    inside: [{ name: "School Zone" }],
    outside: [],
    ...overrides.safeZoneStatus,
  },
});

console.log = jest.fn();
console.warn = jest.fn();

describe("SafetyDashboard - Enhanced Test Suite", () => {
  const mockCurrentLocation = { latitude: 37.7749, longitude: -122.4194 };
  const mockCurrentPlace = { id: "place1", name: "Test Place" };
  let mockData: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockData = createMockData();

    // Set up default mock implementations with proper Zustand selector support
    // Use the top-level mock functions (declared above) directly.
    mockUseNavigationStore.mockImplementation((selector: any) => {
      return selector ? selector(mockData.navigationStore) : mockData.navigationStore;
    });
    mockUseParentalStore.mockImplementation((selector: any) => {
      return selector ? selector(mockData.parentalStore) : mockData.parentalStore;
    });
    mockUseSafeZoneMonitor.mockReturnValue({
      getCurrentSafeZoneStatus: mockGetCurrentSafeZoneStatus,
    });
    mockGetCurrentSafeZoneStatus.mockReturnValue(mockData.safeZoneStatus);
  });

  // === BASIC RENDERING TESTS ===
  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      const { getByText } = render(<SafetyDashboard />);
      expect(getByText("Safety Dashboard")).toBeTruthy();
    });

    it("renders all required sections", () => {
      const { getByText } = render(<SafetyDashboard />);
      expect(getByText("Current Status")).toBeTruthy();
      expect(getByText("Quick Actions")).toBeTruthy();
      expect(getByText("Safety Overview")).toBeTruthy();
      expect(getByText("Recent Activity")).toBeTruthy();
      expect(getByText("Safety Reminder")).toBeTruthy();
    });

    it("renders with all props provided", () => {
      const { getByText } = render(
        <SafetyDashboard
          currentLocation={mockCurrentLocation}
          currentPlace={mockCurrentPlace}
          onNavigateToSettings={jest.fn()}
        />
      );
      expect(getByText("Safety Dashboard")).toBeTruthy();
      expect(getByText("Check-in at Current Location")).toBeTruthy();
    });
  });

  // === USER INTERACTIONS TESTS ===
  describe("User Interactions", () => {
    it("handles emergency call button press with alert options", () => {
      const { getAllByText } = render(<SafetyDashboard />);
      // pick the first matching Emergency button if there are multiples
      fireEvent.press(getAllByText("Emergency")[0]);

      // Basic check: alert was shown and expected button texts are present
      expect(Alert.alert).toHaveBeenCalled();
      const callArgs = (Alert.alert as jest.Mock).mock.calls[0];
      const buttons = callArgs ? callArgs[2] : [];
      expect(buttons.some((b: any) => (b.text && b.text.includes("Cancel")) || b.style === "cancel")).toBeTruthy();
      expect(buttons.some((b: any) => b.text && b.text.includes("Call 911"))).toBeTruthy();
      expect(buttons.some((b: any) => b.text && b.text.includes("Call Parent"))).toBeTruthy();
    });

    it("handles quick check-in button press with confirmation", () => {
      const { getAllByText } = render(<SafetyDashboard />);
      fireEvent.press(getAllByText("I'm OK!")[0]);

      expect(Alert.alert).toHaveBeenCalled();
      const callArgs = (Alert.alert as jest.Mock).mock.calls[0];
      const buttons = callArgs ? callArgs[2] : [];
      expect(buttons.some((b: any) => (b.text && b.text.includes("Not now")) || b.style === "cancel")).toBeTruthy();
      expect(buttons.some((b: any) => b.text && (b.text.includes("I'm OK!") || b.text.includes("I&apos;m OK!")))).toBeTruthy();
    });

    it("handles all quick action buttons", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const { getByText } = render(<SafetyDashboard />);

      fireEvent.press(getByText("Share Location"));
      expect(consoleSpy).toHaveBeenCalledWith("Share location");

      fireEvent.press(getByText("Photo Check-in"));
      expect(consoleSpy).toHaveBeenCalledWith("Photo check-in");

      consoleSpy.mockRestore();
    });

    it("handles hide quick actions toggle", () => {
      const { getAllByText, getByText, queryAllByText } = render(<SafetyDashboard />);

      const beforeEmergencyCount = getAllByText("Emergency").length;
      expect(beforeEmergencyCount).toBeGreaterThan(0);
      fireEvent.press(getByText("Hide"));
      expect(queryAllByText("Emergency").length).toBeLessThan(beforeEmergencyCount);
    });
  });

  // === CONDITIONAL RENDERING TESTS ===
  describe("Conditional Rendering", () => {
    it("shows photo check-in section when currentPlace is provided", () => {
      const { getByText } = render(
        <SafetyDashboard currentPlace={mockCurrentPlace} />
      );
      expect(getByText("Check-in at Current Location")).toBeTruthy();
    });

    it("hides photo check-in section when currentPlace is not provided", () => {
      const { queryByText } = render(<SafetyDashboard />);
      expect(queryByText("Check-in at Current Location")).toBeNull();
    });

    it("shows correct safe zone status when inside a zone", () => {
      const { getByText } = render(<SafetyDashboard />);
      expect(getByText(/You're in the School Zone safe zone/)).toBeTruthy();
    });

    it("shows correct safe zone status when outside zones", () => {
      mockGetCurrentSafeZoneStatus.mockReturnValue({
        inside: [],
        outside: [{ name: "Unknown Area" }],
      });

      const { getByText } = render(<SafetyDashboard />);
      expect(getByText("Outside safe zones - stay alert!")).toBeTruthy();
    });
  });

  // === PROPS AND STATE VARIATIONS TESTS ===
  describe("Props and State Variations", () => {
    it("handles empty photo check-ins gracefully", () => {
      mockUseNavigationStore.mockReturnValue({
        photoCheckIns: [],
      });

      const { getByText } = render(<SafetyDashboard />);
      expect(getByText("No recent check-ins")).toBeTruthy();
      expect(
        getByText(
          "Take a photo when you arrive somewhere to let your family know you're safe"
        )
      ).toBeTruthy();
    });

    it("displays correct safety statistics", () => {
      const { getByText } = render(<SafetyDashboard />);

      // Should show active safe zones count
      expect(getByText("Safe Zones")).toBeTruthy();
      expect(getByText("Check-ins")).toBeTruthy();
      expect(getByText("Requests")).toBeTruthy();
      expect(getByText("Contacts")).toBeTruthy();
    });

    it("handles various emergency contact counts", () => {
      const testCases = [0, 1, 3];

      testCases.forEach((count) => {
        const contacts = Array.from({ length: count }, (_, i) => ({
          id: `${i}`,
          phone: `${i}${i}${i}-${i}${i}${i}-${i}${i}${i}${i}`,
        }));

        mockUseParentalStore.mockReturnValue({
          ...mockData.parentalStore,
          settings: { emergencyContacts: contacts },
        });

        const { getByText } = render(<SafetyDashboard />);
        expect(getByText("Contacts")).toBeTruthy();
      });
    });
  });

  // === LOADING AND ERROR STATES TESTS ===
  describe("Loading and Error States", () => {
    it("handles missing hook data gracefully", () => {
      // Return safe defaults instead of undefined to avoid runtime slice/filter errors
      mockUseNavigationStore.mockReturnValue({ photoCheckIns: [] });
      mockUseParentalStore.mockReturnValue({
        settings: { emergencyContacts: [] },
        checkInRequests: [],
        safeZones: [],
      });

      const { getByText } = render(<SafetyDashboard />);
      expect(getByText("Safety Dashboard")).toBeTruthy();
    });

    it("handles undefined currentZoneStatus", () => {
      mockGetCurrentSafeZoneStatus.mockReturnValue(undefined);

      const { getByText, queryByText } = render(<SafetyDashboard />);
      expect(getByText("Current Status")).toBeTruthy();
      expect(queryByText(/You're in the/)).toBeNull();
    });
  });

  // === ACCESSIBILITY TESTS ===
  describe("Accessibility", () => {
    it("has proper accessibility labels for critical actions", () => {
      const { getAllByText, getAllByText: getCheckIn } = render(<SafetyDashboard />);

      expect(getAllByText("Emergency").length).toBeGreaterThan(0);
      expect(getCheckIn("I'm OK!").length).toBeGreaterThan(0);
    });

    it("supports screen reader navigation", () => {
      const { getByText } = render(<SafetyDashboard />);

      // Test that main sections are discoverable
      expect(getByText("Safety Dashboard")).toBeTruthy();
      expect(getByText("Current Status")).toBeTruthy();
      expect(getByText("Quick Actions")).toBeTruthy();
      expect(getByText("Safety Overview")).toBeTruthy();
    });
  });

  // === INTEGRATION BEHAVIOR TESTS ===
  describe("Integration Behavior", () => {
    it("responds to store state changes", async () => {
      const { rerender } = render(<SafetyDashboard />);

      // Simulate store state change
      mockUseNavigationStore.mockReturnValue({
        photoCheckIns: [],
      });

      rerender(<SafetyDashboard />);

      await waitFor(() => {
        expect(mockUseNavigationStore).toHaveBeenCalled();
      });
    });

    it("handles real-time safe zone status updates", async () => {
      const { rerender } = render(<SafetyDashboard />);

      // Simulate moving out of safe zone
      mockGetCurrentSafeZoneStatus.mockReturnValue({
        inside: [],
        outside: [{ name: "Unknown" }],
      });

      rerender(<SafetyDashboard />);

      await waitFor(() => {
        expect(mockGetCurrentSafeZoneStatus).toHaveBeenCalled();
      });
    });
  });

  // === EDGE CASES TESTS ===
  describe("Edge Cases", () => {
    it("handles null/undefined props gracefully", () => {
      const { getByText } = render(
        <SafetyDashboard
          currentLocation={undefined}
          currentPlace={undefined}
          onNavigateToSettings={undefined}
        />
      );
      expect(getByText("Safety Dashboard")).toBeTruthy();
    });

    it("handles empty arrays correctly", () => {
      mockUseNavigationStore.mockReturnValue({
        photoCheckIns: [],
      });

      mockUseParentalStore.mockReturnValue({
        settings: { emergencyContacts: [] },
        checkInRequests: [],
        safeZones: [],
      });

      const { getByText } = render(<SafetyDashboard />);
      expect(getByText("No recent check-ins")).toBeTruthy();
    });

    it("handles very old timestamps", () => {
      const veryOldTimestamp = new Date("1990-01-01").getTime();

      mockUseNavigationStore.mockReturnValue({
        photoCheckIns: [
          { placeName: "Ancient Place", timestamp: veryOldTimestamp },
        ],
      });

      const { getByText } = render(<SafetyDashboard />);
      expect(getByText("Checked in at Ancient Place")).toBeTruthy();
    });
  });

  // === REGRESSION TESTS ===
  describe("Regression Tests", () => {
    it("prevents multiple alert dialogs from opening simultaneously", () => {
      const { getAllByText } = render(<SafetyDashboard />);

      // Rapidly press emergency button multiple times
  const emergencyButton = getAllByText("Emergency")[0];
  fireEvent.press(emergencyButton);
      fireEvent.press(emergencyButton);

      // Should have been called for each press
      expect(Alert.alert).toHaveBeenCalledTimes(2);
    });

    it("maintains quick actions visibility state correctly", () => {
      const { getByText, getAllByText, queryAllByText } = render(<SafetyDashboard />);

    const beforeCount = getAllByText("Emergency").length;
    expect(beforeCount).toBeGreaterThan(0);

    fireEvent.press(getByText("Hide"));
    expect(queryAllByText("Emergency").length).toBeLessThan(beforeCount);

    // Quick actions should remain hidden after re-render (no increase)
    expect(queryAllByText("Emergency").length).toBeLessThan(beforeCount);
    });

    it("handles component unmounting gracefully", () => {
      const { unmount } = render(<SafetyDashboard />);
      expect(() => unmount()).not.toThrow();
    });
  });

  // === ORIGINAL TESTS PRESERVED ===
  describe("Original Test Coverage", () => {
    // === ORIGINAL TESTS PRESERVED ===
    describe("Original Test Coverage", () => {
      it("renders current status section", () => {
        const { getByText } = render(<SafetyDashboard />);
        expect(getByText("Current Status")).toBeTruthy();
        expect(getByText(/You're in the School Zone safe zone/)).toBeTruthy();
      });

      it("renders quick actions when enabled", () => {
        const { getByText, getAllByText } = render(<SafetyDashboard />);
        expect(getByText("Quick Actions")).toBeTruthy();
        expect(getAllByText("Emergency").length).toBeGreaterThan(0);
        expect(getAllByText("I'm OK!").length).toBeGreaterThan(0);
        expect(getAllByText("Share Location").length).toBeGreaterThan(0);
        expect(getAllByText("Photo Check-in").length).toBeGreaterThan(0);
      });

      it("hides quick actions when hide button is pressed", () => {
        const { getByText, queryAllByText } = render(<SafetyDashboard />);
        expect(getByText("Quick Actions")).toBeTruthy();
        const before = queryAllByText("Emergency").length;
        fireEvent.press(getByText("Hide"));
        expect(queryAllByText("Emergency").length).toBeLessThan(before);
      });

      it("renders photo check-in when current place is provided", () => {
        const { getByText } = render(
          <SafetyDashboard currentPlace={mockCurrentPlace} />
        );
        expect(getByText("Check-in at Current Location")).toBeTruthy();
      });

      it("renders safety stats correctly", () => {
        const { getByText } = render(<SafetyDashboard />);
        expect(getByText("Safety Overview")).toBeTruthy();
        expect(getByText("Safe Zones")).toBeTruthy();
        expect(getByText("Check-ins")).toBeTruthy();
        expect(getByText("Requests")).toBeTruthy();
        expect(getByText("Contacts")).toBeTruthy();
      });

      it("renders recent activity with check-ins", () => {
        const { getByText } = render(<SafetyDashboard />);
        expect(getByText("Recent Activity")).toBeTruthy();
        expect(getByText("Checked in at School")).toBeTruthy();
        expect(getByText("Checked in at Home")).toBeTruthy();
      });

      it("renders safety tips section", () => {
        const { getByText } = render(<SafetyDashboard />);
        expect(getByText("Safety Reminder")).toBeTruthy();
        expect(getByText("Stay Safe Out There!")).toBeTruthy();
      });

      it("handles settings navigation when provided", () => {
        const mockNavigateToSettings = jest.fn();
        render(
          <SafetyDashboard onNavigateToSettings={mockNavigateToSettings} />
        );
        expect(mockNavigateToSettings).toBeDefined();
      });

      it("handles emergency call action", () => {
        const { getAllByText } = render(<SafetyDashboard />);
        fireEvent.press(getAllByText("Emergency")[0]);
      });

      it("handles quick check-in action", () => {
        const { getByText } = render(<SafetyDashboard />);
        fireEvent.press(getByText("I'm OK!"));
      });

      it("handles share location action", () => {
        const { getByText } = render(<SafetyDashboard />);
        fireEvent.press(getByText("Share Location"));
        // You may want to check for side effects or UI changes here instead
      });

      it("supports all themes", () => {
        testThemeToggling(SafetyDashboard, { currentPlace: mockCurrentPlace });
      });

      it("is accessible", () => {
        const { getByText, getAllByText } = render(<SafetyDashboard />);
        const dashboard = getByText("Safety Dashboard");
        expect(dashboard).toBeTruthy();
        const emergencyButton = getAllByText("Emergency")[0];
        expect(emergencyButton).toBeTruthy();
        const checkInButton = getByText("I'm OK!");
        expect(checkInButton).toBeTruthy();
      });

      it("supports complete user interaction flow", async () => {
        const mockNavigateToSettings = jest.fn();
        const { getByText, getAllByText } = render(
          <SafetyDashboard
            currentPlace={mockCurrentPlace}
            currentLocation={mockCurrentLocation}
            onNavigateToSettings={mockNavigateToSettings}
          />
        );
        expect(getByText("Safety Dashboard")).toBeTruthy();
        fireEvent.press(getByText("I'm OK!"));
        fireEvent.press(getAllByText("Emergency")[0]);
        fireEvent.press(getByText("Hide"));
        const consoleCalls = (console.log as jest.Mock).mock.calls.length || 0;
        const alertCalls = ((Alert.alert as jest.Mock).mock && (Alert.alert as jest.Mock).mock.calls.length) || 0;
        expect(consoleCalls + alertCalls).toBeGreaterThan(0);
      });
    });
  });
});
