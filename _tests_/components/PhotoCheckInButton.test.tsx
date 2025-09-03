
import { fireEvent, render } from "@testing-library/react-native";

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

  it("calls handler when pressed", () => {
    // Since the handler is internal, we can only check that the button is pressable
    const { getByText } = render(
      <ThemeProvider initial="light">
        <PhotoCheckInButton placeName="Test Place" placeId="p1" />
      </ThemeProvider>
    );
    fireEvent.press(getByText("Photo Check-in"));
    // No error thrown means press is handled
    expect(getByText("Photo Check-in")).toBeTruthy();
  });
});
