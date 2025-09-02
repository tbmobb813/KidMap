import { render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "styled-components/native";

import CityManagement from "../../components/CityManagement";


describe("CityManagement", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <CityManagement onBack={() => {}} />
      </ThemeProvider>
    );
  });
});
