import { render } from "@testing-library/react-native";
import React from "react";

import DevicePingHandler from "../../components/DevicePingHandler";
import { ThemeProvider } from "../../constants/theme";

describe("DevicePingHandler", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <DevicePingHandler />
      </ThemeProvider>
    );
  });
});
