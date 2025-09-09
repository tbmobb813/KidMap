import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

// No need to re-export render in this test file

describe("Smoke test", () => {
  it("renders a basic text", () => {
    const { getByText } = render(<Text>KidMap</Text>);
    expect(getByText("KidMap")).toBeTruthy();
  });
});
