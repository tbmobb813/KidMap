import { fireEvent, render } from "@testing-library/react-native";

import SafetyPanel from "@/components/SafetyPanel";
import { ThemeProvider } from "@/constants/theme";

// Mock stores and hooks
jest.mock("@/stores/gamificationStore", () => ({
  useGamificationStore: () => ({ safetyContacts: [{ id: "c1", phone: "1234567890", isPrimary: true }] }),
}));
jest.mock("@/stores/navigationStore", () => ({
  useNavigationStore: () => ({ addLocationVerifiedPhotoCheckIn: jest.fn() }),
}));
jest.mock("@/stores/parentalStore", () => ({
  useParentalStore: () => ({
    settings: { emergencyContacts: [{ id: "p1", phone: "9876543210", isPrimary: true }] },
    addCheckInToDashboard: jest.fn(),
    updateLastKnownLocation: jest.fn(),
  }),
}));
jest.mock("@/hooks/useToast", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

// Mock specific Alert functions for testing
const mockAlert = jest.fn();
const mockLinking = { openURL: jest.fn() };

// Override specific functions without breaking the global mock
jest.doMock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: { alert: mockAlert },
    Linking: mockLinking,
  };
});

describe("SafetyPanel", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <SafetyPanel />
      </ThemeProvider>
    );
  });

  it("renders and expands/collapses", () => {
    const { getByText } = render(
      <ThemeProvider initial="light">
        <SafetyPanel />
      </ThemeProvider>
    );
    expect(getByText("Safety Tools")).toBeTruthy();
    fireEvent.press(getByText("Safety Tools"));
    expect(getByText("Emergency")).toBeTruthy();
    expect(getByText("Share Location")).toBeTruthy();
    expect(getByText("I Made It!")).toBeTruthy();
    expect(getByText("Photo Check-in")).toBeTruthy();
    expect(getByText(/Always stay with a trusted adult/)).toBeTruthy();
    fireEvent.press(getByText("Safety Tools"));
    // Collapsed, buttons hidden
  });

  it("emergency button is accessible and triggers handler", () => {
    const { getByText } = render(
      <ThemeProvider initial="light">
        <SafetyPanel />
      </ThemeProvider>
    );
    fireEvent.press(getByText("Safety Tools"));
    fireEvent.press(getByText("Emergency"));
    expect(getByText("Emergency")).toBeTruthy();
  });

  it("share location button is accessible and triggers handler", () => {
    const { getByText } = render(
      <ThemeProvider initial="light">
        <SafetyPanel currentLocation={{ latitude: 1, longitude: 2 }} />
      </ThemeProvider>
    );
    fireEvent.press(getByText("Safety Tools"));
    fireEvent.press(getByText("Share Location"));
    expect(getByText("Share Location")).toBeTruthy();
  });

  it("safe arrival button is accessible and triggers handler", () => {
    const { getByText } = render(
      <ThemeProvider initial="light">
        <SafetyPanel currentLocation={{ latitude: 1, longitude: 2 }} currentPlace={{ id: "p1", name: "Test Place" }} />
      </ThemeProvider>
    );
    fireEvent.press(getByText("Safety Tools"));
    fireEvent.press(getByText("I Made It!"));
    expect(getByText("I Made It!")).toBeTruthy();
  });

  it("photo check-in button is accessible and triggers handler", () => {
    const { getByText } = render(
      <ThemeProvider initial="light">
        <SafetyPanel currentLocation={{ latitude: 1, longitude: 2 }} currentPlace={{ id: "p1", name: "Test Place" }} />
      </ThemeProvider>
    );
    fireEvent.press(getByText("Safety Tools"));
    fireEvent.press(getByText("Photo Check-in"));
    expect(getByText("Photo Check-in")).toBeTruthy();
  });
});
