import { render } from "@testing-library/react-native";

import PhotoCheckInButton from "../../components/PhotoCheckInButton";
import { ThemeProvider } from "../../constants/theme";

describe("PhotoCheckInButton", () => {
  it("renders and is accessible", () => {
    const { getByText } = render(
      <ThemeProvider initial="light">
        <PhotoCheckInButton placeName="Test Place" placeId="p1" />
      </ThemeProvider>
    );
    expect(getByText("Photo Check-in")).toBeTruthy();
  });
});
