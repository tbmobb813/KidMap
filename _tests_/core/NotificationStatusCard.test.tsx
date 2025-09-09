import { render } from "@testing-library/react-native";
import React from "react";

import NotificationStatusCard from "../../components/NotificationStatusCard";
import { ThemeProvider } from "../../constants/theme";

describe("NotificationStatusCard", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <NotificationStatusCard />
      </ThemeProvider>
    );
  });
});
