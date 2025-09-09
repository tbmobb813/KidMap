
import DevicePingHandler from "../../components/DevicePingHandler";
import { render, } from "../testUtils";

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

const mockAlert = jest.fn();
jest.doMock("react-native", () => {
  const RN = jest.requireActual("react-native");
  return { ...RN, Alert: { alert: mockAlert } };
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
  });
});
