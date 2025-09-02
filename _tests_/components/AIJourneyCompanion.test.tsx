import { render } from "@testing-library/react-native";
import React from "react";

import AIJourneyCompanion from "../../components/AIJourneyCompanion";
import { ThemeProvider } from "../../constants/theme";

describe("AIJourneyCompanion", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <AIJourneyCompanion
          currentLocation={{ latitude: 0, longitude: 0 }}
          isNavigating={false}
        />
      </ThemeProvider>
    );
  });
});
