import { render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "styled-components/native";

import DirectionStep from "../../components/DirectionStep";


describe("DirectionStep", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider theme={{ colors: {}, spacing: {} }}>
        <DirectionStep
          step={{
            id: "1",
            type: "walk",
            from: "A",
            to: "B",
            duration: 5
          }}
          isLast={false}
        />
      </ThemeProvider>
    );
  });
});
