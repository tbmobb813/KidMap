import { render } from "@testing-library/react-native";
import React from "react";

import DevicePingHistory from "../../components/DevicePingHistory";
import { ThemeProvider } from "../../constants/theme";

describe("DevicePingHistory", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <DevicePingHistory />
      </ThemeProvider>
    );
  });
});
