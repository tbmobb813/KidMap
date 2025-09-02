import { render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "styled-components/native";

import PinAuthentication from "../../components/PinAuthentication";


describe("PinAuthentication", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider theme={{ colors: {}, spacing: {} }}>
        <PinAuthentication
          onAuthenticated={() => {}}
          onCancel={() => {}}
        />
      </ThemeProvider>
    );
  });
});