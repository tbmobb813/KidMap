import { render } from "@testing-library/react-native";
import React from "react";

import AchievementBadge from "../../components/AchievementBadge";
import { ThemeProvider } from "../../constants/theme";

describe("AchievementBadge", () => {
  it("renders without crashing", () => {
    const achievement = {
      id: "test-id",
      title: "Test Achievement",
      description: "This is a test achievement",
      icon: "test-icon.png", // Provide a valid icon value
      points: 10, // Provide a valid points value
      unlocked: true, // Provide a valid unlocked value
    };
    render(
      <ThemeProvider>
        <AchievementBadge achievement={achievement} />
      </ThemeProvider>
    );
  });
});
