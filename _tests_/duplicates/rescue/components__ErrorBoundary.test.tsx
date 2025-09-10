import { render } from "@testing-library/react-native";
import React from "react";

import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/constants/theme";

describe("ErrorBoundary", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <ErrorBoundary>
          <div>Test Child</div>
        </ErrorBoundary>
      </ThemeProvider>
    );
  });
});
