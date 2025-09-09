import { render } from "@testing-library/react-native";

import CityManagement from "../../components/CityManagement";
import { ThemeProvider } from "../../constants/theme";

describe("CityManagement", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <CityManagement onBack={() => {}} />
      </ThemeProvider>
    );
  });
});
