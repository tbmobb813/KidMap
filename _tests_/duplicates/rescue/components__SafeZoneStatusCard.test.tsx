
import { render } from "@testing-library/react-native";

import { SafeZoneStatusCard } from "@/components/SafeZoneStatusCard";
import { ThemeProvider } from "@/constants/theme";

// Mock hooks
jest.mock("@/modules/safety/hooks/useSafeZoneMonitor", () => ({
  useSafeZoneMonitor: () => ({
    isMonitoring: false,
    getCurrentSafeZoneStatus: () => null,
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
  }),
}));
jest.mock("@/modules/safety/stores/parentalStore", () => ({
  useParentalStore: () => ({
    settings: { safeZoneAlerts: false },
    safeZones: [],
  }),
}));

describe("SafeZoneStatusCard", () => {
  it("renders without crashing", () => {
    const { getByText } = render(
      <ThemeProvider initial="light">
        <SafeZoneStatusCard />
      </ThemeProvider>
    );
    expect(getByText("Safe Zones")).toBeTruthy();
  });
});
