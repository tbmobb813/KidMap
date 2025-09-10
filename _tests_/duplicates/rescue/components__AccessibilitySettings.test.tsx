import { render } from "@testing-library/react-native";
import React from "react";

import AccessibilitySettings from "@/components/AccessibilitySettings";
import { ThemeProvider } from "@/constants/theme";

describe("AccessibilitySettings", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <AccessibilitySettings />
      </ThemeProvider>
    );
  });
});
