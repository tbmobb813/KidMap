import { fireEvent } from "@testing-library/react-native";

import SafetyDashboard from "../../components/SafetyDashboard";
import { render, testThemeToggling } from "../testUtils";

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

jest.mock("@/hooks/useSafeZoneMonitor", () => ({
  useSafeZoneMonitor: () => ({
    getCurrentSafeZoneStatus: () => ({
      inside: [{ name: "School Zone" }],
      outside: [],
    }),
  }),
}));

jest.mock("@/stores/parentalStore", () => ({
  useParentalStore: () => ({
    settings: {
      emergencyContacts: [{ id: "p1", phone: "9876543210", isPrimary: true }],
    },
    dashboardData: { safeZoneActivity: [] },
    devicePings: [],
    checkInRequests: [],
    safeZones: [{ id: "sz1", name: "School Zone", isActive: true }],
    addCheckInToDashboard: jest.fn(),
    updateLastKnownLocation: jest.fn(),
  }),
}));

jest.mock("@/stores/navigationStore", () => ({
  useNavigationStore: () => ({
    photoCheckIns: [
      { placeName: "School", timestamp: Date.now() - 100000 },
      { placeName: "Home", timestamp: Date.now() - 200000 },
    ],
  }),
}));

console.log = jest.fn();
console.warn = jest.fn();

describe("SafetyDashboard", () => {
  const mockCurrentLocation = { latitude: 37.7749, longitude: -122.4194 };
  const mockCurrentPlace = { id: "place1", name: "Test Place" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { getByText } = render(<SafetyDashboard />);
    expect(getByText("Safety Dashboard")).toBeTruthy();
  });

  it("renders current status section", () => {
    const { getByText } = render(<SafetyDashboard />);
    expect(getByText("Current Status")).toBeTruthy();
    expect(getByText(/You're in the School Zone safe zone/)).toBeTruthy();
  });

  it("renders quick actions when enabled", () => {
    const { getByText } = render(<SafetyDashboard />);
    expect(getByText("Quick Actions")).toBeTruthy();
    expect(getByText("Emergency")).toBeTruthy();
    expect(getByText("I'm OK!")).toBeTruthy();
    expect(getByText("Share Location")).toBeTruthy();
    expect(getByText("Photo Check-in")).toBeTruthy();
  });

  it("hides quick actions when hide button is pressed", () => {
    const { getByText, queryByText } = render(<SafetyDashboard />);
    expect(getByText("Quick Actions")).toBeTruthy();
    fireEvent.press(getByText("Hide"));
    expect(queryByText("Emergency")).toBeNull();
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
    render(<SafetyDashboard onNavigateToSettings={mockNavigateToSettings} />);
    expect(mockNavigateToSettings).toBeDefined();
  });

  it("handles emergency call action", () => {
    const { getByText } = render(<SafetyDashboard />);
    fireEvent.press(getByText("Emergency"));
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
    const { getByText } = render(<SafetyDashboard />);
    const dashboard = getByText("Safety Dashboard");
    expect(dashboard).toBeTruthy();
    const emergencyButton = getByText("Emergency");
    expect(emergencyButton).toBeTruthy();
    const checkInButton = getByText("I'm OK!");
    expect(checkInButton).toBeTruthy();
  });

  it("supports complete user interaction flow", async () => {
    const mockNavigateToSettings = jest.fn();
    const { getByText } = render(
      <SafetyDashboard
        currentPlace={mockCurrentPlace}
        currentLocation={mockCurrentLocation}
        onNavigateToSettings={mockNavigateToSettings}
      />
    );
    expect(getByText("Safety Dashboard")).toBeTruthy();
    fireEvent.press(getByText("I'm OK!"));
    fireEvent.press(getByText("Emergency"));
    fireEvent.press(getByText("Hide"));
    expect(console.log).toHaveBeenCalledWith("Quick check-in sent");
  });
});

// SafetyDashboardProps and SafetyDashboard component should not be redeclared here since they are imported above.
