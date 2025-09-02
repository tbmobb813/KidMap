import { render } from "@testing-library/react-native";
import React from "react";

import AccessibleButton from "../../components/AccessibleButton";

import { ThemeProvider } from "@/constants/theme";


describe("AccessibleButton", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider>
        <AccessibleButton title="Test Button" onPress={() => {}} />
      </ThemeProvider>
    );
  });
});
