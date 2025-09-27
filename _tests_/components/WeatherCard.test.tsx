/**
 * WeatherCard Component Tests
 *
 * Basic test suite for WeatherCard weather display component.
 * Tests weather conditions, icons, temperature display, and theme integration.
 */

import { render } from "@testing-library/react-native";
import React from "react";

import { createTestWrapper } from "../testUtils";

import WeatherCard from "@/components/WeatherCard";

// Mock lucide-react-native icons
jest.mock("lucide-react-native", () => ({
  Sun: ({ size, color }: any) => `MockSun-${size}-${color}`,
  Cloud: ({ size, color }: any) => `MockCloud-${size}-${color}`,
  CloudRain: ({ size, color }: any) => `MockCloudRain-${size}-${color}`,
  Snowflake: ({ size, color }: any) => `MockSnowflake-${size}-${color}`,
  Wind: ({ size, color }: any) => `MockWind-${size}-${color}`,
}));

describe("WeatherCard", () => {
  const mockWeatherData = {
    temperature: 22,
    condition: "Sunny",
    recommendation: "Perfect weather for walking!",
  };

  it("renders basic weather information", () => {
    const wrapper = createTestWrapper();
    const { getByTestId, getByText } = render(
      <WeatherCard weather={mockWeatherData} />,
      { wrapper }
    );

    expect(getByTestId("weather-card")).toBeTruthy();
    expect(getByText("22°C")).toBeTruthy();
    expect(getByText("Sunny")).toBeTruthy();
    expect(getByText("Perfect weather for walking!")).toBeTruthy();
  });

  it("displays temperature in Celsius format", () => {
    const coldWeather = { ...mockWeatherData, temperature: -5 };
    const wrapper = createTestWrapper();
    const { getByText } = render(<WeatherCard weather={coldWeather} />, {
      wrapper,
    });

    expect(getByText("-5°C")).toBeTruthy();
  });

  it("displays recommendation text", () => {
    const customRecommendation = {
      ...mockWeatherData,
      recommendation: "Bring an umbrella!",
    };
    const wrapper = createTestWrapper();
    const { getByText } = render(
      <WeatherCard weather={customRecommendation} />,
      { wrapper }
    );

    expect(getByText("Bring an umbrella!")).toBeTruthy();
  });

  it("handles different weather conditions", () => {
    const conditions = ["Sunny", "Cloudy", "Rainy", "Snowy", "Unknown"];

    conditions.forEach((condition) => {
      const weather = { ...mockWeatherData, condition };
      const wrapper = createTestWrapper();
      const { getByText } = render(<WeatherCard weather={weather} />, {
        wrapper,
      });

      expect(getByText(condition)).toBeTruthy();
    });
  });

  it("handles case-insensitive weather conditions", () => {
    const lowerCaseWeather = { ...mockWeatherData, condition: "sunny" };
    const wrapper = createTestWrapper();
    const { getByText } = render(<WeatherCard weather={lowerCaseWeather} />, {
      wrapper,
    });

    expect(getByText("sunny")).toBeTruthy();
  });

  it("renders with correct test ID", () => {
    const wrapper = createTestWrapper();
    const { getByTestId } = render(<WeatherCard weather={mockWeatherData} />, {
      wrapper,
    });

    expect(getByTestId("weather-card")).toBeTruthy();
  });

  it("displays different temperature values correctly", () => {
    const temperatures = [0, -10, 35, 100];

    temperatures.forEach((temperature) => {
      const weather = { ...mockWeatherData, temperature };
      const wrapper = createTestWrapper();
      const { getByText } = render(<WeatherCard weather={weather} />, {
        wrapper,
      });

      expect(getByText(`${temperature}°C`)).toBeTruthy();
    });
  });

  it("displays long recommendations correctly", () => {
    const longRecommendation =
      "This is a very long weather recommendation that might span multiple lines and should still render correctly in the component";
    const weather = { ...mockWeatherData, recommendation: longRecommendation };
    const wrapper = createTestWrapper();
    const { getByText } = render(<WeatherCard weather={weather} />, {
      wrapper,
    });

    expect(getByText(longRecommendation)).toBeTruthy();
  });

  it("handles edge case weather conditions", () => {
    const edgeCases = ["", "WINDY", "Fog", "Thunderstorm"];

    edgeCases.forEach((condition) => {
      const weather = { ...mockWeatherData, condition };
      const wrapper = createTestWrapper();
      const { getByTestId } = render(<WeatherCard weather={weather} />, {
        wrapper,
      });

      // Should render without crashing
      expect(getByTestId("weather-card")).toBeTruthy();
    });
  });
});
