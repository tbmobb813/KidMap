import { render } from "@testing-library/react-native";
import React from "react";

import PhotoCheckInHistory from "../../components/PhotoCheckInHistory";
import { ThemeProvider } from "../../constants/theme";

describe("PhotoCheckInHistory", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider>
        <PhotoCheckInHistory />
      </ThemeProvider>
    );
  });
});
