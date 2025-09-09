import { render, act, waitFor } from "@testing-library/react-native";
import React from "react";

import Toast from "@/components/Toast";
import { ThemeProvider } from "@/constants/theme";

jest.mock(
  "react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo",
  () => {
    const actual = jest.requireActual("react-native");
    return {
      ...actual.AccessibilityInfo,
      announceForAccessibility: jest.fn(),
      setAccessibilityFocus: jest.fn(),
    };
  }
);

jest.mock("@/utils/accessibility/accessibility", () => ({
  announce: jest.fn(),
}));

describe("Toast accessibility", () => {
  let announce: jest.Mock;
  beforeEach(() => {
    announce = require("@/utils/accessibility/accessibility").announce;
    announce.mockReset();
  });
  it("announces message when visible", async () => {
    const { update } = render(
      <ThemeProvider>
        <Toast
          message="Hello"
          type="success"
          visible={false}
          onHide={() => {}}
          disableAnimation={true}
        />
      </ThemeProvider>
    );
    expect(announce).not.toHaveBeenCalled();
    await act(async () => {
      update(
        <ThemeProvider>
          <Toast
            message="Hello"
            type="success"
            visible={true}
            onHide={() => {}}
            disableAnimation={true}
          />
        </ThemeProvider>
      );
    });
    await waitFor(
      () => {
        expect(announce).toHaveBeenCalledWith("Success: Hello");
      },
      { timeout: 2000 }
    );
  });
});
