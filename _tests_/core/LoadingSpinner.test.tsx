import { render } from "@testing-library/react-native";
import React from "react";

import LoadingSpinner from "../../components/LoadingSpinner";
import { ThemeProvider } from "../../constants/theme";

describe("LoadingSpinner", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <LoadingSpinner />
      </ThemeProvider>
    );
  });
});
