import React from "react";

import AccessibilitySettings from "../../components/AccessibilitySettings";
import { render } from "../testUtils";

// Mock the navigation store with correct path
jest.mock("@/stores/navigationStore", () => ({
  useNavigationStore: () => ({
    accessibilitySettings: {
      largeText: false,
      highContrast: false,
      voiceEnabled: false,
    },
    updateAccessibilitySettings: jest.fn(),
  }),
}));

// Mock telemetry
jest.mock("@/telemetry", () => ({
  track: jest.fn(),
  setTelemetryEnabled: jest.fn(),
  isTelemetryEnabled: jest.fn(() => false),
}));

describe("AccessibilitySettings", () => {
  it("renders without crashing", () => {
    render(<AccessibilitySettings />);
  });
});
