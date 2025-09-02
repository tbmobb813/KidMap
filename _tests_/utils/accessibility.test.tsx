import React from "react";

import { render, mockRoute } from "../testUtils";

import CategoryButton from "@/components/CategoryButton";
import RouteCard from "@/components/RouteCard";
import TravelModeSelector from "@/components/TravelModeSelector";
import VoiceNavigation from "@/components/VoiceNavigation";
import { Route } from "@/types/navigation";

const sampleRoute: Route = mockRoute;

describe("Accessibility roles & labels", () => {
  it("adds accessibility props to RouteCard", () => {
    const { getByLabelText } = render(
      <RouteCard route={sampleRoute} onPress={() => {}} />
    );
    expect(getByLabelText(/Route option/)).toBeTruthy();
  });

  it("adds accessibility props to CategoryButton", () => {
    const { getByLabelText } = render(
      <CategoryButton category="home" onPress={() => {}} />
    );
    expect(getByLabelText(/home category button/i)).toBeTruthy();
  });

  it("adds accessibility props to TravelModeSelector buttons", () => {
    const { getByLabelText } = render(
      <TravelModeSelector selectedMode="transit" onModeChange={() => {}} />
    );
    expect(getByLabelText(/Transit travel mode/)).toBeTruthy();
  });

  it("adds accessibility props to VoiceNavigation controls", () => {
    const { getByLabelText } = render(<VoiceNavigation />);
    // Label includes 'voice commands' when not listening
    expect(getByLabelText(/voice commands/i)).toBeTruthy();
  });
});
