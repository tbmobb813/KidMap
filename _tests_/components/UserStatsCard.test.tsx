
import { render } from "@testing-library/react-native";

import UserStatsCard from "../../components/UserStatsCard";
import { ThemeProvider } from "../../constants/theme";

describe("UserStatsCard", () => {
  it("renders with stats", () => {
    const stats = {
      level: 2,
      totalPoints: 100,
      totalTrips: 10,
      placesVisited: 5,
      streakDays: 3,
      favoriteTransitMode: "bus"
    };
    const { getByText } = render(
      <ThemeProvider initial="light">
        <UserStatsCard stats={stats} />
      </ThemeProvider>
    );
    expect(getByText("Level 2")).toBeTruthy();
    expect(getByText("100 points")).toBeTruthy();
    expect(getByText("10")).toBeTruthy(); // Trips
    expect(getByText("5")).toBeTruthy(); // Places
    expect(getByText("3")).toBeTruthy(); // Streak
  });
});
