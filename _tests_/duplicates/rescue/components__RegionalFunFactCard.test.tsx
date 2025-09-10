import { render } from "@testing-library/react-native";
import React from "react";

import RegionalFunFactCard from "@/components/RegionalFunFactCard";
import { ThemeProvider } from "@/constants/theme";

describe("RegionalFunFactCard", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <RegionalFunFactCard />
      </ThemeProvider>
    );
  });
});
