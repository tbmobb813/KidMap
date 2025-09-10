import { render } from "@testing-library/react-native";
import React from "react";

import PullToRefresh from "@/components/PullToRefresh";
import { ThemeProvider } from "@/constants/theme";

describe("PullToRefresh", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <PullToRefresh onRefresh={async () => {}}>
          <></>
        </PullToRefresh>
      </ThemeProvider>
    );
  });
});
