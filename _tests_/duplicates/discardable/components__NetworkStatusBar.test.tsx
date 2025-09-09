import { render } from "@testing-library/react-native";
import React from "react";

import NetworkStatusBar from "@/components/NetworkStatusBar";
import { ThemeProvider } from "@/constants/theme";

describe("NetworkStatusBar", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <NetworkStatusBar />
      </ThemeProvider>
    );
  });
});
