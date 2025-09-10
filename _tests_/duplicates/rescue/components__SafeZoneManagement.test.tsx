import { render } from "@testing-library/react-native";
import React from "react";

import SafeZoneManagement from "@/components/SafeZoneManagement";
import { ThemeProvider } from "@/constants/theme";
import { ParentalProvider } from "@/stores/parentalStore";

describe("SafeZoneManagement", () => {
  it("renders without crashing", () => {
    render(
      <ParentalProvider>
        <ThemeProvider initial="light">
          <SafeZoneManagement onBack={() => {}} />
        </ThemeProvider>
      </ParentalProvider>
    );
  });
});
