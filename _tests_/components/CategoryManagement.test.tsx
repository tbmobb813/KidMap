import { render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "styled-components/native";

import CategoryManagement from "../../components/CategoryManagement";


describe("CategoryManagement", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider theme={{ mode: "light" }}>
        <CategoryManagement onBack={() => {}} userMode="parent" />
      </ThemeProvider>
    );
  });
});
