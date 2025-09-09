import { render } from "@testing-library/react-native";

import SafetyPanel from "../../components/SafetyPanel";
import { ThemeProvider } from "../../constants/theme";

jest.mock("@/stores/gamificationStore", () => ({
  useGamificationStore: () => ({
    safetyContacts: [{ id: "c1", phone: "1234567890", isPrimary: true }],
  }),
}));
jest.mock("@/stores/navigationStore", () => ({
  useNavigationStore: () => ({ addLocationVerifiedPhotoCheckIn: jest.fn() }),
}));
jest.mock("@/stores/parentalStore", () => ({
  useParentalStore: () => ({
    settings: {
      emergencyContacts: [{ id: "p1", phone: "9876543210", isPrimary: true }],
    },
    addCheckInToDashboard: jest.fn(),
    updateLastKnownLocation: jest.fn(),
  }),
}));
jest.mock("@/hooks/useToast", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

const mockAlert = jest.fn();
const mockLinking = { openURL: jest.fn() };

jest.doMock("react-native", () => {
  const RN = jest.requireActual("react-native");
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
});
