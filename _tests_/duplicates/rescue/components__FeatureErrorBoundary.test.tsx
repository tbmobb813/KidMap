import { render } from "@testing-library/react-native";
import React from "react";

import FeatureErrorBoundary from "@/components/FeatureErrorBoundary";
import { ThemeProvider } from "@/constants/theme";

describe("FeatureErrorBoundary", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <FeatureErrorBoundary>
          <div>Test Child</div>
        </FeatureErrorBoundary>
      </ThemeProvider>
    );
  });
});
