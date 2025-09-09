import { render } from "@testing-library/react-native";
import React from "react";

import ArrivalAlert from "../../components/ArrivalAlert";
import { ThemeProvider } from "../../constants/theme";

describe("ArrivalAlert", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider>
        <ArrivalAlert
          arrival={{
            id: "test-id",
            line: "Blue",
            color: "#0000FF",
            destination: "Central Station",
            arrivalTime: 5,
            type: "train",
          }}
          onDismiss={jest.fn()}
        />
      </ThemeProvider>
    );
  });
});
