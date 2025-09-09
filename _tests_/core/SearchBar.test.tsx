import { render } from "@testing-library/react-native";

import SearchBar from "../../components/SearchBar";
import { ThemeProvider } from "../../constants/theme";

describe("SearchBar", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider initial="light">
        <SearchBar value="" onChangeText={() => {}} onClear={() => {}} />
      </ThemeProvider>
    );
  });
});
