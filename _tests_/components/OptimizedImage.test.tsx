import { render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "styled-components/native";

import OptimizedImage from "../../components/OptimizedImage";


describe("OptimizedImage", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider theme={{}}>
        <OptimizedImage source={{ uri: "https://example.com/image.jpg" }} />
      </ThemeProvider>
    );
  });
});
