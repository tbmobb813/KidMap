import React from "react";

import { render, fireEvent } from "../testUtils";

import RouteCard from "@/components/RouteCard";

// Mock lucide icons used by RouteCard
jest.mock("lucide-react-native", () => ({
  Clock: ({ size, _color }: any) => {
    const { Text } = require("react-native");
    return Text({ testID: "icon-Clock", children: `Clock(${size})` });
  },
  ArrowRight: ({ size, _color }: any) => {
    const { Text } = require("react-native");
    return Text({ testID: "icon-ArrowRight", children: `ArrowRight(${size})` });
  },
}));

describe("RouteCard minimal", () => {
  it("renders unavailable when route is null", () => {
    const { getByText } = render(<RouteCard route={null} onPress={() => {}} />);
    expect(getByText("Route unavailable")).toBeTruthy();
  });

  it("displays duration label and times", () => {
    const route = { id: "r1", name: "R1", totalDuration: 25, departureTime: "09:00", arrivalTime: "09:25", steps: [] };
    const { getByText } = render(<RouteCard route={route as any} onPress={() => {}} />);
    expect(getByText("25 min")).toBeTruthy();
    expect(getByText("09:00 - 09:25")).toBeTruthy();
  });

  it("calls onPress with the route when pressed", () => {
    const route = { id: "r2", name: "R2", totalDuration: 10, departureTime: "10:00", arrivalTime: "10:10", steps: [] };
    const onPress = jest.fn();
    const { getByTestId } = render(<RouteCard route={route as any} onPress={onPress} />);
    fireEvent.press(getByTestId("route-card-r2"));
    expect(onPress).toHaveBeenCalledWith(route);
  });

  it("shows 'No steps' when steps are empty", () => {
    const route = { id: "r3", name: "R3", totalDuration: 0, departureTime: null, arrivalTime: null, steps: [] };
    const { getByText } = render(<RouteCard route={route as any} onPress={() => {}} />);
    expect(getByText("No steps")).toBeTruthy();
  });
});
