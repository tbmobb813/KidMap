import { render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "styled-components/native";

import LiveArrivalsCard from "../../components/LiveArrivalsCard";


describe("LiveArrivalsCard", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider theme={{ colors: {}, spacing: {} }}>
        <LiveArrivalsCard stationName="Test Station" arrivals={[]} />
      </ThemeProvider>
    );
  });
});
