import { render } from "@testing-library/react-native";
import React from "react";

import RegionalTransitCard from "../../components/RegionalTransitCard";
import { ThemeProvider } from "../../constants/theme";

describe("RegionalTransitCard", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <RegionalTransitCard />
      </ThemeProvider>
    );
  });
});
