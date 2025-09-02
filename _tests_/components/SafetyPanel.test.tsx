import { render } from "@testing-library/react-native";
import React from "react";

import SafetyPanel from "../../components/SafetyPanel";
import { ThemeProvider } from "../../constants/theme";

describe("SafetyPanel", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <SafetyPanel />
      </ThemeProvider>
    );
  });
});
