import { render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "styled-components/native";

import ParentDashboard from "../../components/ParentDashboard";


describe("ParentDashboard", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider theme={{}}>
        <ParentDashboard onExit={() => {}} />
      </ThemeProvider>
    );
  });
});
