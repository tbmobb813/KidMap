import { render } from "@testing-library/react-native";
import React from "react";

import DevicePingHistory from "../../components/DevicePingHistory";
import { ThemeProvider } from "../../constants/theme";

jest.mock("@/stores/parentalStore", () => ({
  useParentalStore: () => ({
    devicePings: [
      {
        id: "ping1",
        type: "location",
        status: "pending",
        message: "Test ping message",
        requestedAt: Date.now(),
      },
      {
        id: "ping2",
        type: "ring",
        status: "acknowledged",
        requestedAt: Date.now() - 100000,
        response: {
          timestamp: Date.now() - 90000,
          location: { latitude: 10.1234, longitude: 20.5678 },
        },
      },
    ],
  }),
}));

describe("DevicePingHistory", () => {
  it("renders ping history with pings", () => {
    const { getByText } = render(
      <ThemeProvider initial="light">
        <DevicePingHistory testId="ping-history" />
      </ThemeProvider>
    );
    expect(getByText("Device Ping History")).toBeTruthy();
    expect(getByText("Location Request")).toBeTruthy();
    expect(getByText("Device Ring")).toBeTruthy();
    expect(getByText("Test ping message")).toBeTruthy();
    expect(getByText(/Location shared:/)).toBeTruthy();
  });

  it("renders empty state when no pings", () => {
    jest.mock("@/stores/parentalStore", () => ({
      useParentalStore: () => ({ devicePings: [] }),
    }));
    const { getByText } = render(
      <ThemeProvider initial="light">
        <DevicePingHistory testId="ping-history-empty" />
      </ThemeProvider>
    );
    expect(getByText("No Device Pings")).toBeTruthy();
    expect(getByText(/Device ping history will appear here/)).toBeTruthy();
  });
});
