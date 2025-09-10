import { render } from "@testing-library/react-native";
import React from "react";

import RegionSwitcher from "@/components/RegionSwitcher";
import { ThemeProvider } from "@/constants/theme";

describe("RegionSwitcher", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <RegionSwitcher />
      </ThemeProvider>
    );
  });
});
