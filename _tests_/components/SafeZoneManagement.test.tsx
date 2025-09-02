import { render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "styled-components/native";

import SafeZoneManagement from "../../components/SafeZoneManagement";
import { ThemeProvider } from "../../constants/theme";
import { ParentalProvider } from "../../stores/parentalStore";

describe("SafeZoneManagement", () => {
  it("renders without crashing", () => {
    const mockParentalStore = {
      safeZones: [],
      addSafeZone: jest.fn(),
      updateSafeZone: jest.fn(),
      deleteSafeZone: jest.fn(),
      settings: {},
      checkInRequests: [],
      dashboardData: {
        recentCheckIns: [],
        pendingCategoryApprovals: [],
        safeZoneActivity: [],
      },
      devicePings: [],
      isParentMode: false,
      isLoading: false,
    };
    render(
      <ParentalProvider value={mockParentalStore}>
        <ThemeProvider initial="light">
          <SafeZoneManagement onBack={() => {}} />
        </ThemeProvider>
      </ParentalProvider>
    );
  });
});
