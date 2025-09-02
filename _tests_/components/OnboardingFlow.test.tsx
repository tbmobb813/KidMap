import { render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "styled-components/native";

import OnboardingFlow from "../../components/OnboardingFlow";


describe("OnboardingFlow", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider theme={{ colors: {}, spacing: {} }}>
        <OnboardingFlow onComplete={() => {}} />
      </ThemeProvider>
    );
  });
});
