import { fireEvent } from "@testing-library/react-native";
import React from "react";

import { render } from "../testUtils";

import VoiceNavigation from "@/components/VoiceNavigation";
import { TransitStep } from "@/types/navigation";

jest.mock("@/utils/accessibility/accessibility", () => ({
  announce: jest.fn(),
}));
jest.mock("@/stores/navigationStore", () => ({
  useNavigationStore: () => ({
    accessibilitySettings: { voiceDescriptions: true },
  }),
}));

describe("VoiceNavigation (S3-3)", () => {
  const steps: TransitStep[] = [
    { id: "s1", type: "walk", from: "Home", to: "Corner", duration: 2 },
    { id: "s2", type: "bus", from: "Corner", to: "Station", duration: 5 },
    { id: "s3", type: "train", from: "Station", to: "Downtown", duration: 10 },
  ];

  it("renders first step instruction and step meta", () => {
    const { getByTestId, getByText } = render(
      <VoiceNavigation steps={steps} />
    );
    expect(getByTestId("voice-active-instruction").props.children).toMatch(
      /Walk from Home to Corner/
    );
    expect(getByText("Step 1/3")).toBeTruthy();
  });

  it("navigates to next and previous steps updating instruction", () => {
    const { getByTestId } = render(<VoiceNavigation steps={steps} />);
    const next = getByTestId("voice-next");
    fireEvent.press(next);
    expect(getByTestId("voice-active-instruction").props.children).toMatch(
      /Take from Corner to Station/
    );
    fireEvent.press(next);
    expect(getByTestId("voice-active-instruction").props.children).toMatch(
      /Take from Station to Downtown/
    );
    const prev = getByTestId("voice-prev");
    fireEvent.press(prev);
    expect(getByTestId("voice-active-instruction").props.children).toMatch(
      /Take from Corner to Station/
    );
  });

  it("re-announces current step when repeat pressed", () => {
    const { getByTestId } = render(<VoiceNavigation steps={steps} />);
    const repeat = getByTestId("voice-repeat");
    const { announce } = require("@/utils/accessibility/accessibility");
    fireEvent.press(repeat);
    expect(announce).toHaveBeenCalledWith(
      "Walk from Home to Corner",
      expect.any(Object)
    );
  });
});
