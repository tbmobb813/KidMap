import { render } from "@testing-library/react-native";

import DirectionStep from "../../components/DirectionStep";
import { ThemeProvider } from "../../constants/theme";

describe("DirectionStep", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <DirectionStep
          step={{ id: "1", type: "walk", from: "A", to: "B", duration: 5 }}
          isLast={false}
        />
      </ThemeProvider>
    );
  });
});
