
import { render } from "@testing-library/react-native";

import WeatherCard from "../../components/WeatherCard";
import { ThemeProvider } from "../../constants/theme";

describe("WeatherCard", () => {
  it("renders without crashing", () => {
    const mockWeather = {
      temperature: 25,
      condition: "Sunny",
      humidity: 50,
      windSpeed: 10,
      recommendation: "Wear sunglasses",
    };
    render(
      <ThemeProvider initial="light">
        <WeatherCard weather={mockWeather} />
      </ThemeProvider>
    );
  });
});
