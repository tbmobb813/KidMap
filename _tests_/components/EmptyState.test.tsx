import { render } from "@testing-library/react-native";
import React from "react";

import EmptyState from "../../components/EmptyState";

import { ThemeProvider } from "@/constants/theme";


describe("EmptyState", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <EmptyState
          icon={require("lucide-react-native").Activity}
          title="Test Title"
          description="Test Description"
        />
      </ThemeProvider>
    );
  });
});
