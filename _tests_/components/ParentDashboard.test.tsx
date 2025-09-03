
import { fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import ParentDashboard from "../../components/ParentDashboard";
import { render, testThemeToggling } from "../testUtils";

// Mock the stores
const mockSendDevicePing = jest.fn();
const mockRequestCheckIn = jest.fn();
const mockApproveCategory = jest.fn();

// Mock hooks
jest.mock("@/stores/parentalStore", () => ({
  useParentalStore: () => ({
    dashboardData: {
      lastKnownLocation: {
        latitude: 37.7749,
        longitude: -122.4194,
        timestamp: Date.now() - 300000,
        placeName: "School",
      },
      recentCheckIns: [
        {
          id: "checkin1",
          placeName: "Home",
          timestamp: Date.now() - 100000,
          photoUrl: "test-photo.jpg",
        },
      ],
      safeZoneActivity: [],
    },
    safeZones: [
      {
        id: "zone1",
        name: "School Zone",
        radius: 100,
        isActive: true,
        notifications: {
          onEntry: true,
          onExit: false,
        },
      },
    ],
    checkInRequests: [
      {
        id: "request1",
        message: "Please check in",
        requestedAt: Date.now() - 200000,
        status: "pending",
      },
    ],
    settings: {
      allowChildCategoryCreation: true,
      requireApprovalForCategories: true,
      safeZoneAlerts: true,
      checkInReminders: false,
      emergencyContacts: [
        { id: "contact1", phone: "1234567890", isPrimary: true },
      ],
    },
    devicePings: [],
    sendDevicePing: mockSendDevicePing,
    requestCheckIn: mockRequestCheckIn,
  }),
}));

// Mock the safety module store path as well
jest.mock("@/modules/safety/stores/parentalStore", () => ({
  useParentalStore: () => ({
    safeZones: [
      {
        id: "zone1",
        name: "School Zone",
        radius: 100,
        isActive: true,
        notifications: {
          onEntry: true,
          onExit: false,
        },
      },
    ],
    settings: {
      allowChildCategoryCreation: true,
      requireApprovalForCategories: true,
      safeZoneAlerts: true,
      checkInReminders: false,
      emergencyContacts: [
        { id: "contact1", phone: "1234567890", isPrimary: true },
      ],
    },
    devicePings: [],
  }),
}));

jest.mock("@/stores/categoryStore", () => ({
  useCategoryStore: () => ({
    getPendingCategories: () => [
      {
        id: "cat1",
        name: "Museum",
        icon: "building",
        color: "#FF0000",
        status: "pending",
      },
    ],
    approveCategory: mockApproveCategory,
  }),
}));

// Remove redundant Alert override - handled in jest.setup.js

describe("ParentDashboard", () => {
  const mockOnExit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders main dashboard view", () => {
    const { getByText } = render(
      <ParentDashboard onExit={mockOnExit} />
    );
    expect(getByText("Parent Dashboard")).toBeTruthy();
    expect(getByText("Overview")).toBeTruthy();
    expect(getByText("Quick Actions")).toBeTruthy();
  });

  it("renders navigation tabs", () => {
    const { getByText } = render(<ParentDashboard onExit={mockOnExit} />);
    expect(getByText("Overview")).toBeTruthy();
    expect(getByText("Check-ins")).toBeTruthy();
    expect(getByText("Safe Zones")).toBeTruthy();
    expect(getByText("Device Pings")).toBeTruthy();
  });

  it("renders quick actions", () => {
    const { getByText } = render(<ParentDashboard onExit={mockOnExit} />);
    expect(getByText("Request Check-in")).toBeTruthy();
    expect(getByText("Get Location")).toBeTruthy();
    expect(getByText("Ring Device")).toBeTruthy();
    expect(getByText("Send Message")).toBeTruthy();
  });

  it("handles request check-in action", () => {
    const { getByText } = render(<ParentDashboard onExit={mockOnExit} />);
    
    fireEvent.press(getByText("Request Check-in"));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      "Request Check-in",
      "Send a check-in request to your child?",
      expect.any(Array)
    );
  });

  it("handles get location action", async () => {
    const { getByText } = render(<ParentDashboard onExit={mockOnExit} />);
    
    fireEvent.press(getByText("Get Location"));
    
    await waitFor(() => {
      expect(mockSendDevicePing).toHaveBeenCalledWith(
        "location",
        "Parent requested your location"
      );
    });
  });

  it("handles ring device action", async () => {
    const { getByText } = render(<ParentDashboard onExit={mockOnExit} />);
    
    fireEvent.press(getByText("Ring Device"));
    
    await waitFor(() => {
      expect(mockSendDevicePing).toHaveBeenCalledWith(
        "ring",
        "Parent is pinging your device"
      );
    });
  });

  it("handles send message action", () => {
    const { getByText } = render(<ParentDashboard onExit={mockOnExit} />);
    
    fireEvent.press(getByText("Send Message"));
    
    expect(Alert.prompt).toHaveBeenCalled();
  });

  it("renders last known location when available", () => {
    const { getByText } = render(<ParentDashboard onExit={mockOnExit} />);
    expect(getByText("Last Known Location")).toBeTruthy();
    expect(getByText("School")).toBeTruthy();
  });

  it("switches tabs correctly", () => {
    const { getByText } = render(<ParentDashboard onExit={mockOnExit} />);
    
    // Switch to Check-ins tab
    fireEvent.press(getByText("Check-ins"));
    
    // Switch to Safe Zones tab
    fireEvent.press(getByText("Safe Zones"));
    
    // Switch to Device Pings tab
    fireEvent.press(getByText("Device Pings"));
    
    // Should not crash and tab should be accessible
    expect(getByText("Device Pings")).toBeTruthy();
  });

  it("supports all themes", () => {
    testThemeToggling(ParentDashboard, { onExit: mockOnExit });
  });

  // Integration test for complete dashboard interaction
  it("supports complete parent dashboard flow", async () => {
    const { getByText } = render(<ParentDashboard onExit={mockOnExit} />);

    // Parent views dashboard
    expect(getByText("Parent Dashboard")).toBeTruthy();

    // Parent requests check-in
    fireEvent.press(getByText("Request Check-in"));
    expect(Alert.alert).toHaveBeenCalled();

    // Parent gets location
    fireEvent.press(getByText("Get Location"));
    await waitFor(() => {
      expect(mockSendDevicePing).toHaveBeenCalledWith(
        "location",
        "Parent requested your location"
      );
    });

    // Parent navigates between tabs
    fireEvent.press(getByText("Safe Zones"));
    fireEvent.press(getByText("Device Pings"));
    fireEvent.press(getByText("Overview"));

    // All actions should complete without error
    expect(mockSendDevicePing).toHaveBeenCalled();
  });
});
