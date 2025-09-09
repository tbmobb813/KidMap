import React from "react";
import { Text } from "react-native";

import { render } from "../testUtils";

// No need to re-export render in this test file

describe("Smoke test", () => {
  it("renders a basic text", () => {
    const { getByText } = render(<Text>KidMap</Text>);
    expect(getByText("KidMap")).toBeTruthy();
  });
});
