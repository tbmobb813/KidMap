import { jest } from "@jest/globals";

import ParentDashboard from "../../components/ParentDashboard";
import { render, } from "../testUtils";

const mockSendDevicePing = jest.fn();
const mockRequestCheckIn = jest.fn();
const mockApproveCategory = jest.fn();

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
        notifications: { onEntry: true, onExit: false },
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

jest.mock("@/modules/safety/stores/parentalStore", () => ({
  useParentalStore: () => ({
    safeZones: [
      {
        id: "zone1",
        name: "School Zone",
        radius: 100,
        isActive: true,
        notifications: { onEntry: true, onExit: false },
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

describe("ParentDashboard", () => {
  const mockOnExit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders main dashboard view", () => {
    const { getByText } = render(<ParentDashboard onExit={mockOnExit} />);
    expect(getByText("Parent Dashboard")).toBeTruthy();
  });
});
