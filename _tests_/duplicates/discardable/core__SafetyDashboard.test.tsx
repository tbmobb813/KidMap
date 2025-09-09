import { render } from "../../testUtils";

import SafetyDashboard from "@/components/SafetyDashboard";

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
  ImagePickerResult: {},
}));

jest.mock("@/components/PhotoCheckInButton", () => {
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

jest.mock("@/components/SafeZoneIndicator", () => ({
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { getByText } = render(<SafetyDashboard />);
    expect(getByText("Safety Dashboard")).toBeTruthy();
  });
});
