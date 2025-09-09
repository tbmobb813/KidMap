import { render } from "@testing-library/react-native";
import React from "react";

import { SafeZoneActivityLog } from "@/components/SafeZoneActivityLog";
import { ThemeProvider } from "@/constants/theme";

describe("SafeZoneActivityLog", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <SafeZoneActivityLog />
      </ThemeProvider>
    );
  });
});