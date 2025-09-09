import { render as rtlRender } from "@testing-library/react-native";
import React from "react";

// If your app uses context/providers, wrap children here
const render = (ui: React.ReactElement, options?: any) =>
  rtlRender(ui, { ...options });

// import { render } from "./testUtils";

import DirectionStep from "@/components/DirectionStep";
import { TransitStep } from "@/types/navigation";

describe("DirectionStep nullability safeguards", () => {
  it("renders placeholder when step is null", () => {
    const { getByText } = render(<DirectionStep step={null} isLast />);
    expect(getByText("Step unavailable")).toBeTruthy();
    expect(getByText("Data missing")).toBeTruthy();
  });

  it("renders fallbacks for missing fields", () => {
    // Intentionally omit from/to to simulate bad data shape; cast to TransitStep for test
    const incomplete: Partial<TransitStep> = {
      id: "s2",
      type: "bus",
      duration: NaN,
    };
    const { getByText } = render(
      <DirectionStep step={incomplete as TransitStep} isLast />
    );
    expect(getByText("Bus")).toBeTruthy();
    expect(getByText("Unknown start")).toBeTruthy();
    expect(getByText("Unknown destination")).toBeTruthy();
    expect(getByText("--")).toBeTruthy();
  });
});
