
import { fireEvent, waitFor } from "@testing-library/react-native";

import DevicePingHandler from "../../components/DevicePingHandler";
import { render, testThemeToggling } from "../testUtils";

// Mock the stores and hooks
const mockAcknowledgePing = jest.fn();
const mockUpdateLastKnownLocation = jest.fn();

jest.mock("@/hooks/useLocation", () => () => ({
  location: { latitude: 37.7749, longitude: -122.4194, error: null },
}));

jest.mock("@/stores/parentalStore", () => ({
  useParentalStore: () => ({
    devicePings: [
      {
        id: "ping1",
        type: "location",
        status: "pending",
        message: "Where are you?",
        requestedAt: Date.now(),
      },
    ],
    acknowledgePing: mockAcknowledgePing,
    updateLastKnownLocation: mockUpdateLastKnownLocation,
  }),
}));

// Mock Alert functions for testing
const mockAlert = jest.fn();
jest.doMock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: { alert: mockAlert },
  };
});

describe("DevicePingHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAcknowledgePing.mockResolvedValue(undefined);
  });

  it("renders overlay when there is a pending ping", () => {
    const { getByTestId, getByText } = render(
      <DevicePingHandler testId="ping-overlay" />
    );
    expect(getByTestId("ping-overlay")).toBeTruthy();
    expect(getByText("Location Request")).toBeTruthy();
    expect(getByText("Where are you?")).toBeTruthy();
  });

  it("renders share location and decline buttons for location ping", () => {
    const { getByText } = render(<DevicePingHandler testId="ping-handler" />);
    expect(getByText("Share Location")).toBeTruthy();
    expect(getByText("Decline")).toBeTruthy();
  });

  it("handles share location button press", async () => {
    const { getByText } = render(<DevicePingHandler testId="ping-handler" />);
    
    fireEvent.press(getByText("Share Location"));
    
    await waitFor(() => {
      expect(mockAcknowledgePing).toHaveBeenCalledWith("ping1", {
        latitude: 37.7749,
        longitude: -122.4194,
      });
      expect(mockUpdateLastKnownLocation).toHaveBeenCalled();
    });
  });

  it("handles decline button press", async () => {
    const { getByText } = render(<DevicePingHandler testId="ping-handler" />);
    
    fireEvent.press(getByText("Decline"));
    
    await waitFor(() => {
      expect(mockAcknowledgePing).toHaveBeenCalledWith("ping1", undefined);
    });
  });

  it("supports all themes", () => {
    testThemeToggling(DevicePingHandler, { testId: "ping-handler" });
  });

  it("formats ping time correctly", () => {
    const { getByText } = render(<DevicePingHandler testId="ping-handler" />);
    expect(getByText(/Received/)).toBeTruthy();
  });

  it("handles errors in acknowledgment", async () => {
    // Mock acknowledgePing to reject
    mockAcknowledgePing.mockRejectedValueOnce(new Error("Network error"));
    
    const { getByText } = render(<DevicePingHandler testId="ping-handler" />);
    
    fireEvent.press(getByText("Share Location"));
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Error",
        "Failed to respond to ping. Please try again."
      );
    });
  });

  // Integration test for complete ping handling flow
  it("supports complete ping acknowledgment flow", async () => {
    const { getByText } = render(<DevicePingHandler testId="ping-handler" />);

    // Verify ping is displayed
    expect(getByText("Location Request")).toBeTruthy();
    expect(getByText("Where are you?")).toBeTruthy();

    // User chooses to share location
    fireEvent.press(getByText("Share Location"));

    // Verify acknowledgment was called correctly
    await waitFor(() => {
      expect(mockAcknowledgePing).toHaveBeenCalledWith("ping1", {
        latitude: 37.7749,
        longitude: -122.4194,
      });
      expect(mockUpdateLastKnownLocation).toHaveBeenCalledWith({
        latitude: 37.7749,
        longitude: -122.4194,
        timestamp: expect.any(Number),
        placeName: "Current Location",
      });
    });
  });
});
