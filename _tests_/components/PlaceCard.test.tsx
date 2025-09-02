import { render } from "@testing-library/react-native";
import React from "react";

import PlaceCard from "../../components/PlaceCard";
import { ThemeProvider } from "../../constants/theme";
import { Place } from "../../types/navigation";

describe("PlaceCard", () => {
  const mockPlace: Place = {
    id: "1",
    name: "Test Place",
    address: "123 Test St",
    category: "park",
    coordinates: { latitude: 0, longitude: 0 },
  };

  const mockOnPress = jest.fn();

  it("renders correctly", () => {
    render(
      <ThemeProvider>
        <PlaceCard place={mockPlace} onPress={mockOnPress} />
      </ThemeProvider>
    );
  });
});
