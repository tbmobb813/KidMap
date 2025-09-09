import { render } from "@testing-library/react-native";

import { SafeZoneIndicator } from "../../components/SafeZoneIndicator";
import { ThemeProvider } from "../../constants/theme";

jest.mock("@/hooks/useSafeZoneMonitor", () => ({
  useSafeZoneMonitor: () => ({
    isMonitoring: false,
    getCurrentSafeZoneStatus: () => null,
  }),
}));
jest.mock("@/stores/parentalStore", () => ({
  useParentalStore: () => ({
    settings: { safeZoneAlerts: false },
    safeZones: [],
  }),
}));

describe("SafeZoneIndicator", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <SafeZoneIndicator />
      </ThemeProvider>
    );
  });
});
