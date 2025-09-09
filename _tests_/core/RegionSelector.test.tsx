import { render } from "@testing-library/react-native";
import React from "react";

import RegionSelector from "../../components/RegionSelector";

import { ThemeProvider } from "@/constants/theme";

describe("RegionSelector", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider>
        <RegionSelector
          regions={
            [
              /* large regions array omitted for brevity */
            ]
          }
          selectedRegion="north"
          onSelectRegion={() => {}}
        />
      </ThemeProvider>
    );
  });
});
