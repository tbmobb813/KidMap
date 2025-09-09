import { render } from "@testing-library/react-native";
import React from "react";

import CategoryButton from "@/components/CategoryButton";
import { ThemeProvider } from "@/constants/theme";

describe("CategoryButton", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <CategoryButton onPress={() => {}} />
      </ThemeProvider>
    );
  });
});
