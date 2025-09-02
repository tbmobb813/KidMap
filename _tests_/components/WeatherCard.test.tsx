import { render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "styled-components/native";

import WeatherCard from "../../components/WeatherCard";


describe("WeatherCard", () => {
  it("renders without crashing", () => {
    const mockWeather = {
      temperature: 25,
      condition: "Sunny",
      humidity: 50,
      windSpeed: 10,
      recommendation: "Wear sunglasses",
    };
    const theme = {
      colors: {
        primary: "#007bff",
        background: "#fff",
        text: "#222",
      },
      spacing: {
        small: 8,
        medium: 16,
        large: 24,
      },
    };
    render(
      <ThemeProvider theme={theme}>
        <WeatherCard weather={mockWeather} />
      </ThemeProvider>
    );
  });
});
