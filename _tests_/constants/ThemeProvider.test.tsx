import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Button, Text } from "react-native";

import { ThemeProvider, useTheme, useThemeControls } from "../../constants/theme";


describe("ThemeProvider", () => {
  const TestConsumer: React.FC = () => {
    const theme = useTheme();
    const { toggleDarkMode, enableHighContrast, setScheme } = useThemeControls();
    return (
      <>
        <Text testID="themeName">{theme.name}</Text>
        <Button title="Toggle" onPress={toggleDarkMode} />
        <Button title="HighContrast" onPress={() => enableHighContrast(true)} />
        <Button title="SetDark" onPress={() => setScheme("dark")} />
        <Button title="SetLight" onPress={() => setScheme("light")} />
      </>
    );
  };

  it("renders children and provides theme context", () => {
    const { getByTestId } = render(
      <ThemeProvider initial="light">
        <TestConsumer />
      </ThemeProvider>
    );
    expect(getByTestId("themeName").props.children).toBe("light");
  });

  it("toggles dark mode", () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider initial="light">
        <TestConsumer />
      </ThemeProvider>
    );
    act(() => {
      fireEvent.press(getByText("Toggle"));
    });
    expect(getByTestId("themeName").props.children).toBe("dark");
  });

  it("enables high contrast mode", () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider initial="light">
        <TestConsumer />
      </ThemeProvider>
    );
    act(() => {
      fireEvent.press(getByText("HighContrast"));
    });
    expect(getByTestId("themeName").props.children).toBe("highContrast");
  });

  it("sets dark mode via setScheme", () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider initial="light">
        <TestConsumer />
      </ThemeProvider>
    );
    act(() => {
      fireEvent.press(getByText("SetDark"));
    });
    expect(getByTestId("themeName").props.children).toBe("dark");
  });

  it("sets light mode via setScheme", () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider initial="dark">
        <TestConsumer />
      </ThemeProvider>
    );
    act(() => {
      fireEvent.press(getByText("SetLight"));
    });
    expect(getByTestId("themeName").props.children).toBe("light");
  });
});
