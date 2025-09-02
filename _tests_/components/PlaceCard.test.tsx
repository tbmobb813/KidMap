import { render } from "@testing-library/react-native";
import React from "react";

import PlaceCard from "../../components/PlaceCard";
import { ThemeProvider } from "../../constants/theme";
// Define PlaceCategory type inline since it's not exported from PlaceCard
type PlaceCategory = "park" | "museum" | "restaurant" | "other";

describe("PlaceCard", () => {
  const mockPlace = {
    id: "1",
    name: "Test Place",
    address: "123 Test St", // Added address property
    category: "park" as PlaceCategory, // Use a valid PlaceCategory value here
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
