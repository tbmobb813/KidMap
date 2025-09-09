import { render } from "@testing-library/react-native";
import React from "react";

import ApiErrorBoundary from "../../components/ApiErrorBoundary";
import { ThemeProvider } from "../../constants/theme";

describe("ApiErrorBoundary", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <ApiErrorBoundary />
      </ThemeProvider>
    );
  });
});
