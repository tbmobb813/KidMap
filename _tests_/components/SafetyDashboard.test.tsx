import { render } from "@testing-library/react-native";
import React from "react";

import SafetyDashboard from "../../components/SafetyDashboard";
import { ThemeProvider } from "../../constants/theme";

describe("SafetyDashboard", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <SafetyDashboard />
      </ThemeProvider>
    );
  });
});
