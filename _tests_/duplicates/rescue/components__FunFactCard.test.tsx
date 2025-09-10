import { render } from "@testing-library/react-native";
import React from "react";

import FunFactCard from "@/components/FunFactCard";
import { ThemeProvider } from "@/constants/theme";

describe("FunFactCard", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider>
        <FunFactCard fact="Test fact" />
      </ThemeProvider>
    );
  });
});
