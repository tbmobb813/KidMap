import { render } from "@testing-library/react-native";
import React from "react";

import MapPlaceholder from "../../components/MapPlaceholder";
import { ThemeProvider } from "../../constants/theme";

describe("MapPlaceholder", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <MapPlaceholder />
      </ThemeProvider>
    );
  });
});
