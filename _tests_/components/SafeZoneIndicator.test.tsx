import { render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "styled-components/native";

import { SafeZoneIndicator } from "../../components/SafeZoneIndicator";


describe("SafeZoneIndicator", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider theme={{ colors: {}, spacing: {} }}>
        <SafeZoneIndicator />
      </ThemeProvider>
    );
  });
});
