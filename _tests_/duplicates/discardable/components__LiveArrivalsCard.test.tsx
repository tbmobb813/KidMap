
import { render } from "@testing-library/react-native";

import LiveArrivalsCard from "@/components/LiveArrivalsCard";
import { ThemeProvider } from "@/constants/theme";

describe("LiveArrivalsCard", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <LiveArrivalsCard stationName="Test Station" arrivals={[]} />
      </ThemeProvider>
    );
  });
});
