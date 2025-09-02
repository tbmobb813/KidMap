import { render } from "@testing-library/react-native";
import React from "react";

import RegionSelector from "../../components/RegionSelector";

import { ThemeProvider } from "@/constants/theme";


describe("RegionSelector", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider>
        <RegionSelector
          regions={[
            {
              id: "north",
              name: "North",
              country: "CountryA",
              timezone: "UTC+1",
              currency: "USD",
              population: 1000000,
              area: 50000,
              language: "English",
              capital: "North City",
              code: "NTH",
              description: "Northern region",
              region: "North",
              subregion: "Far North",
              coordinates: { latitude: 45.0, longitude: -93.0 },
              transitSystems: [
                { id: "metro", name: "Metro", type: "train", color: "#4285F4" },
                { id: "bus", name: "Bus", type: "bus", color: "#34A853" },
              ],
              emergencyNumber: "911",
            },
            {
              id: "south",
              name: "South",
              country: "CountryA",
              timezone: "UTC+1",
              currency: "USD",
              population: 900000,
              area: 45000,
              language: "English",
              capital: "South City",
              code: "STH",
              description: "Southern region",
              region: "South",
              subregion: "Far South",
              coordinates: { latitude: 41.0, longitude: -97.0 },
              transitSystems: [
                { id: "bus", name: "Bus", type: "bus", color: "#34A853" },
              ],
              emergencyNumber: "911",
            },
            {
              id: "east",
              name: "East",
              country: "CountryA",
              timezone: "UTC+1",
              currency: "USD",
              population: 800000,
              area: 40000,
              language: "English",
              capital: "East City",
              code: "EST",
              description: "Eastern region",
              region: "East",
              subregion: "Far East",
              coordinates: { latitude: 44.0, longitude: -91.0 },
              transitSystems: [
                { id: "train", name: "Train", type: "train", color: "#4285F4" },
              ],
              emergencyNumber: "911",
            },
            {
              id: "west",
              name: "West",
              country: "CountryA",
              timezone: "UTC+1",
              currency: "USD",
              population: 700000,
              area: 35000,
              language: "English",
              capital: "West City",
              code: "WST",
              description: "Western region",
              region: "West",
              subregion: "Far West",
              coordinates: { latitude: 43.0, longitude: -95.0 },
              transitSystems: [
                { id: "tram", name: "Tram", type: "tram", color: "#FF9800" },
              ],
              emergencyNumber: "911",
            },
          ]}
          selectedRegion="north"
          onSelectRegion={() => {}}
        />
      </ThemeProvider>
    );
  });
});
