import { render } from "@testing-library/react-native";
import React from "react";

import OfflineIndicator from "../../components/OfflineIndicator";
import { ThemeProvider } from "../../constants/theme";

describe("OfflineIndicator", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <OfflineIndicator />
      </ThemeProvider>
    );
  });
});
