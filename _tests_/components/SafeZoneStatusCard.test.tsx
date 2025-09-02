import { render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "styled-components/native";

import { SafeZoneStatusCard } from "../../components/SafeZoneStatusCard";


describe("SafeZoneStatusCard", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider theme={{ colors: {}, spacing: {} }}>
        <SafeZoneStatusCard />
      </ThemeProvider>
    );
  });
});
